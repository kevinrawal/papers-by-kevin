"""The sample content, copied from the design's Admin.dc.html.

It is inserted on first run so a fresh database looks like the design, and it
backs the desk's "Reset to sample" button.
"""

from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Post, Project, _now

_P1_BODY = """We had a retrieval quality problem, or so the dashboard said. Support answers were citing the wrong runbook about one time in six, and our recall@10 on the eval set sat at 0.71. So we did the obvious thing: added a cross-encoder reranker, tuned the chunker, and pushed recall@10 to 0.82. Then the human review scores dropped by nine percent.

## The metric we were optimising was not the metric that mattered

Recall@10 asks: is the right chunk anywhere in the top ten? The generator asks a different question: of the ten things you handed me, how many are about something else? More relevant chunks meant a fuller context window — the correct paragraph now sat in position seven of a 6,000-token prompt, surrounded by nine plausible neighbours from adjacent runbooks.

The model did what models do with plausible neighbours. It blended them.

> More relevant context is not the same as less irrelevant context.

## What we changed

- A relevance floor, not a top-k. We stopped passing a fixed ten chunks and started passing everything above a calibrated reranker score. Median context dropped from ten chunks to three.
- Chunks that end where the thought ends. Splitting on headings rather than a 512-token window removed most of the half-sentences.
- An eval that scores the answer, not the search. Retrieval metrics are diagnostic; the number we trust is a graded answer against a rubric.

## The part I got wrong for months

I treated retrieval as a search problem with a language model attached. It is closer to a distributed systems problem: every component is locally correct and the failure lives in the composition. Nobody owned the question of what the prompt should contain, so it contained everything anyone thought might help.

If you take one thing from this: measure the thing you ship, not the stage you happen to be tuning."""


SEED_POSTS: list[dict] = [
    {
        "id": "p1",
        "title": "Why our RAG pipeline got worse when we made retrieval better",
        "topic": "AI Engineering",
        "dek": "Recall went up eleven points and answer quality fell. The reranker was doing its job; the context window was not.",
        "date": "Jul 2026",
        "read": "12 min",
        "status": "published",
        "tags": "Retrieval, Evals",
        "body": _P1_BODY,
    },
    {
        "id": "p2",
        "title": "Backpressure, or how we stopped melting the embedding service",
        "topic": "Distributed Systems",
        "dek": "A queue with no ceiling is a queue that fails at the worst possible moment. Notes on bounded buffers and honest 429s.",
        "date": "Jun 2026",
        "read": "9 min",
        "status": "published",
        "tags": "Queues, Reliability",
        "body": "Notes to come.",
    },
    {
        "id": "p3",
        "title": "The Saturday the consumer group drained backwards",
        "topic": "Work Log",
        "dek": "An offset reset, a rebalance storm, and four hours of reprocessing paid-for invoices. What the runbook was missing.",
        "date": "Jun 2026",
        "read": "7 min",
        "status": "published",
        "tags": "Incidents, Kafka",
        "body": "Notes to come.",
    },
    {
        "id": "p4",
        "title": "Structured output: schemas beat prompt engineering",
        "topic": "AI Engineering",
        "dek": "Every retry we removed came from constraining the decoder, not from adding another sentence about JSON.",
        "date": "May 2026",
        "read": "8 min",
        "status": "published",
        "tags": "LLM",
        "body": "Notes to come.",
    },
    {
        "id": "p5",
        "title": "Idempotency keys are a product decision",
        "topic": "Distributed Systems",
        "dek": "Where the key comes from decides what 'the same request' means — and that is a question for the people writing the spec.",
        "date": "May 2026",
        "read": "10 min",
        "status": "published",
        "tags": "APIs",
        "body": "Notes to come.",
    },
    {
        "id": "p6",
        "title": "Running a vector index that outgrew memory",
        "topic": "AI Engineering",
        "dek": "Sharding by tenant, warming from disk, and the p99 that only appears on Monday mornings.",
        "date": "Apr 2026",
        "read": "11 min",
        "status": "published",
        "tags": "Retrieval, Infra",
        "body": "Notes to come.",
    },
    {
        "id": "p7",
        "title": "Reading Raft for the third time",
        "topic": "Distributed Systems",
        "dek": "The paper is short. Leader election is not the hard part; membership changes are, and I keep relearning it.",
        "date": "Mar 2026",
        "read": "6 min",
        "status": "published",
        "tags": "Consensus",
        "body": "Notes to come.",
    },
    {
        "id": "p8",
        "title": "What I would tell myself at six months in",
        "topic": "Career",
        "dek": "Read the code before the doc. Ask the boring question in the meeting. Write the incident note nobody asked for.",
        "date": "Feb 2026",
        "read": "5 min",
        "status": "published",
        "tags": "Career",
        "body": "Notes to come.",
    },
]


SEED_PROJECTS: list[dict] = [
    {
        "id": "j1",
        "kind": "Retrieval",
        "name": "Grain",
        "blurb": "A small RAG harness that scores answers instead of chunks: pluggable retrievers, a relevance-floor selector, and a weekly rubric eval that runs against sampled production traffic.",
        "learned": "Built after the reranker incident — the eval loop turned out to be the whole product.",
        "stack": "Python · pgvector · FastAPI",
        "href": "https://github.com/kevinrawal",
    },
    {
        "id": "j2",
        "kind": "Distributed Systems",
        "name": "Rafter",
        "blurb": "A Raft implementation written from the paper, with a deterministic network simulator that injects partitions, delays and duplicate messages on a fixed seed.",
        "learned": "Leader election took a weekend. Joint-consensus membership changes took a month.",
        "stack": "Go · deterministic sim",
        "href": "https://github.com/kevinrawal",
    },
    {
        "id": "j3",
        "kind": "Infrastructure",
        "name": "Sluice",
        "blurb": "A bounded work queue with admission control: token-bucket shedding, per-tenant fairness, and a load-shedding dashboard that shows what got dropped and why.",
        "learned": "Honest 429s are kinder than a queue that silently grows for six hours.",
        "stack": "Go · Redis · Grafana",
        "href": "https://github.com/kevinrawal",
    },
    {
        "id": "j4",
        "kind": "Tooling",
        "name": "Postmortem Kit",
        "blurb": "Templates and a small CLI for writing incident notes fast — timeline scaffolding from log exports, and a prompt for the contributing-factors section that avoids naming people.",
        "learned": "The note nobody asked me to write is the one people still link to.",
        "stack": "TypeScript · CLI",
        "href": "https://github.com/kevinrawal",
    },
]


def _insert_seed(db: Session) -> None:
    # Lists are served newest-first, so walk the seed backwards in time to keep
    # the design's order (p1 at the top).
    base = _now()
    for offset, row in enumerate(SEED_POSTS):
        db.add(Post(created_at=base - timedelta(seconds=offset), **row))
    for offset, row in enumerate(SEED_PROJECTS):
        db.add(Project(created_at=base - timedelta(seconds=offset), **row))
    db.commit()


def seed_if_empty(db: Session) -> None:
    has_posts = db.scalar(select(Post.id).limit(1))
    has_projects = db.scalar(select(Project.id).limit(1))
    if has_posts or has_projects:
        return
    _insert_seed(db)


def reset_to_seed(db: Session) -> tuple[int, int]:
    db.query(Post).delete()
    db.query(Project).delete()
    db.commit()
    _insert_seed(db)
    return len(SEED_POSTS), len(SEED_PROJECTS)
