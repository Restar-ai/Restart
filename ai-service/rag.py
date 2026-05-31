import json
import os
from sentence_transformers import SentenceTransformer
import chromadb

_model = None
_collection = None

def _get_model():
    global _model
    if _model is None:
        print("Loading embedding model...")
        local_path = os.path.join(os.path.dirname(__file__), "models", "paraphrase-multilingual-MiniLM-L12-v2")
        model_source = local_path if os.path.exists(local_path) else "paraphrase-multilingual-MiniLM-L12-v2"
        _model = SentenceTransformer(model_source)
        print("Embedding model loaded.")
    return _model

def _get_collection():
    global _collection
    if _collection is None:
        client = chromadb.Client()
        _collection = client.get_or_create_collection("restart_knowledge")
    return _collection

def _load_professions(knowledge_dir, documents, ids, metadatas):
    path = os.path.join(knowledge_dir, "professions.json")
    with open(path, encoding="utf-8") as f:
        professions = json.load(f)

    for prof in professions:
        chunks = [
            f"{prof['title']}: {prof['description']}",
            f"{prof['title']} - Tugas: {prof['tasks']}",
            f"{prof['title']} - Skill yang dibutuhkan: {prof['skills_needed']}",
            f"{prof['title']} - Cara memulai karier: {prof['how_to_start']}",
            f"{prof['title']} - Jenjang karier: {prof['career_path']}",
            f"{prof['title']} - Gaji: {prof['salary_range']}. Tipe kepribadian: {prof['riasec']}",
        ]
        for i, chunk in enumerate(chunks):
            documents.append(chunk)
            ids.append(f"{prof['id']}_chunk_{i}")
            metadatas.append({"source": "professions", "title": prof["title"]})

    return len(professions)

def _load_generic(knowledge_dir, filename, documents, ids, metadatas):
    path = os.path.join(knowledge_dir, filename)
    if not os.path.exists(path):
        return 0
    with open(path, encoding="utf-8") as f:
        items = json.load(f)

    source = filename.replace(".json", "")
    for item in items:
        text = f"{item['title']}: {item['content']}"
        documents.append(text)
        ids.append(f"{source}_{item['id']}")
        metadatas.append({"source": source, "title": item["title"]})

    return len(items)

def load_knowledge():
    collection = _get_collection()

    if collection.count() > 0:
        print(f"Knowledge base already loaded ({collection.count()} documents).")
        return

    knowledge_dir = os.path.join(os.path.dirname(__file__), "knowledge")
    model = _get_model()
    documents, ids, metadatas = [], [], []

    n_professions = _load_professions(knowledge_dir, documents, ids, metadatas)
    n_jobs = _load_generic(knowledge_dir, "job_search.json", documents, ids, metadatas)
    n_rights = _load_generic(knowledge_dir, "rights_and_support.json", documents, ids, metadatas)
    n_freelance = _load_generic(knowledge_dir, "freelance_guide.json", documents, ids, metadatas)

    embeddings = model.encode(documents).tolist()
    collection.add(documents=documents, embeddings=embeddings, ids=ids, metadatas=metadatas)

    print(
        f"Knowledge base loaded: {len(documents)} chunks "
        f"({n_professions} professions, {n_jobs} job tips, "
        f"{n_rights} rights/support, {n_freelance} freelance guides)"
    )


def retrieve(query: str, n_results: int = 4) -> list[str]:
    collection = _get_collection()
    model = _get_model()

    query_embedding = model.encode([query]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=n_results)

    return results["documents"][0] if results["documents"] else []
