"""Streamlit 챗봇 UI.

실행:
    streamlit run app.py
"""

import shutil
import subprocess
from pathlib import Path

import streamlit as st
from chain import get_rag_chain, retrieve_parent_docs, stream_answer

from config import REPORTS_DIR, VECTORSTORE_DIR

# ── 페이지 설정 ──
st.set_page_config(page_title="HiLab Insight", page_icon="🔬", layout="wide")
st.title("🔬 HiLab Insight — 연구실 RAG 챗봇")
st.caption("로컬 보고서 기반 질의응답 시스템 (100% 오프라인)")

# ── 세션 초기화 ──
if "messages" not in st.session_state:
    st.session_state.messages = []

if "rag" not in st.session_state:
    with st.spinner("RAG 체인 로딩 중…"):
        try:
            st.session_state.rag = get_rag_chain()
        except Exception as e:
            st.error(f"벡터 DB 로드 실패. 먼저 `python ingest.py`를 실행하세요.\n\n{e}")
            st.stop()

# ── 채팅 기록 출력 ──
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if msg.get("sources"):
            with st.expander("📎 참고 출처"):
                for src in msg["sources"]:
                    st.markdown(f"**{src['file']}** (관련도: {src.get('score', '-')})")
                    st.code(src["text"][:800], language=None)

# ── 사용자 입력 ──
if user_input := st.chat_input("보고서에 대해 질문하세요…"):
    # 사용자 메시지 표시
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # 스트리밍 답변 생성
    with st.chat_message("assistant"):
        with st.spinner("문서 검색 중…"):
            # 대화 기록 전달 (대화 기억 기능)
            chat_history = [
                {"role": m["role"], "content": m["content"]}
                for m in st.session_state.messages[:-1]  # 현재 질문 제외
            ]

            # 스트리밍 출력
            placeholder = st.empty()
            full_answer = ""
            parent_docs = []

            for token, docs in stream_answer(
                user_input,
                st.session_state.rag,
                chat_history=chat_history,
            ):
                full_answer += token
                parent_docs = docs
                placeholder.markdown(full_answer + "▌")

            placeholder.markdown(full_answer)

        # 출처 표기
        sources = []
        with st.expander("📎 참고 출처"):
            for doc in parent_docs:
                file_name = doc["metadata"].get("source_file", "unknown")
                page = doc["metadata"].get("page", "")
                score = doc.get("relevance_score", "")
                loc = f"{file_name}" + (f" (p.{page+1})" if isinstance(page, int) else "")
                snippet = doc["text"][:800]
                sources.append({"file": loc, "text": snippet, "score": score})
                st.markdown(f"**{loc}** (관련도: {score})")
                st.code(snippet, language=None)

    # 기록 저장
    st.session_state.messages.append({
        "role": "assistant",
        "content": full_answer,
        "sources": sources,
    })

# ── 사이드바 ──
with st.sidebar:
    st.header("ℹ️ 사용 안내")
    st.markdown("""\
1. `reports_data/` 폴더에 보고서(PDF, DOCX, TXT)를 넣으세요.
2. `python ingest.py` 로 문서를 벡터 DB에 적재하세요.
3. `streamlit run app.py` 로 챗봇을 실행하세요.
""")
    st.divider()
    st.markdown("**모든 처리는 로컬에서 수행됩니다.**  \n외부 API 호출 없음.")
    if st.button("💬 대화 초기화"):
        st.session_state.messages = []
        st.rerun()

    st.divider()

    # ── 문서 업로드 ──
    st.header("📁 문서 관리")
    uploaded_files = st.file_uploader(
        "보고서 업로드 (PDF, DOCX, TXT)",
        type=["pdf", "docx", "txt"],
        accept_multiple_files=True,
    )

    if uploaded_files:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        new_files = []
        for uf in uploaded_files:
            dest = REPORTS_DIR / uf.name
            if not dest.exists():
                dest.write_bytes(uf.getbuffer())
                new_files.append(uf.name)

        if new_files:
            st.success(f"{len(new_files)}개 파일 저장됨: {', '.join(new_files)}")
            st.info("벡터 DB에 반영하려면 아래 '문서 재적재' 버튼을 누르세요.")

    if st.button("🔄 문서 재적재 (ingest)"):
        with st.spinner("문서를 벡터 DB에 적재 중… (수 분 소요)"):
            result = subprocess.run(
                ["python", "ingest.py"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                cwd=str(Path(__file__).parent),
            )
            if result.returncode == 0:
                st.success("적재 완료! 페이지를 새로고침하세요.")
                st.code(result.stdout[-1000:] if len(result.stdout) > 1000 else result.stdout)
                # 세션 초기화하여 새 벡터 DB 로드
                for key in ["rag", "messages"]:
                    if key in st.session_state:
                        del st.session_state[key]
                st.rerun()
            else:
                st.error("적재 실패!")
                st.code(result.stderr[-500:] if result.stderr else result.stdout[-500:])

    st.divider()

    # ── 벡터 DB 현황 ──
    if st.toggle("📊 벡터 DB 현황 보기", value=False):
        import json, os
        from collections import defaultdict

        parent_path = Path("vectorstore/parent_docs.json")
        faiss_path = Path("vectorstore/index.faiss")
        pkl_path = Path("vectorstore/index.pkl")
        bm25_path = Path("vectorstore/bm25_index.pkl")

        if not parent_path.exists():
            st.warning("벡터 DB가 없습니다. `python ingest.py`를 먼저 실행하세요.")
        else:
            data = json.loads(parent_path.read_text(encoding="utf-8"))

            # 파일별 통계 집계
            stats = defaultdict(lambda: {"count": 0, "total_chars": 0, "min": 99999, "max": 0})
            for v in data.values():
                src = v["metadata"].get("source_file", "알 수 없음")
                length = len(v["text"].strip())
                s = stats[src]
                s["count"] += 1
                s["total_chars"] += length
                s["min"] = min(s["min"], length)
                s["max"] = max(s["max"], length)

            total_chars = sum(s["total_chars"] for s in stats.values())

            # 요약 메트릭
            col1, col2 = st.columns(2)
            col1.metric("총 청크 수", f"{len(data)}개")
            col2.metric("총 텍스트", f"{total_chars:,}자")

            if faiss_path.exists() and pkl_path.exists():
                faiss_kb = os.path.getsize(faiss_path) / 1024
                pkl_kb = os.path.getsize(pkl_path) / 1024
                col1.metric("FAISS 인덱스", f"{faiss_kb:.0f} KB")
                col2.metric("메타데이터", f"{pkl_kb:.0f} KB")

            if bm25_path.exists():
                bm25_kb = os.path.getsize(bm25_path) / 1024
                st.metric("BM25 인덱스", f"{bm25_kb:.0f} KB")

            st.markdown("---")
            st.markdown("**파일별 상세**")

            rows = []
            for src in sorted(stats.keys()):
                s = stats[src]
                avg = s["total_chars"] / s["count"]
                if s["total_chars"] >= 10000:
                    status = "🟢 충분"
                elif s["total_chars"] >= 2000:
                    status = "🟡 양호"
                elif s["total_chars"] >= 500:
                    status = "🟠 보통"
                else:
                    status = "🔴 부족"

                short_name = src if len(src) <= 40 else src[:37] + "…"
                rows.append({
                    "파일": short_name,
                    "청크": s["count"],
                    "총 글자수": f"{s['total_chars']:,}",
                    "평균": f"{avg:.0f}",
                    "상태": status,
                })

            import pandas as pd
            df = pd.DataFrame(rows)
            st.dataframe(df, use_container_width=True, hide_index=True)
