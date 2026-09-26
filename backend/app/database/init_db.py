from app.database.database import engine, Base
from app.models.document import Document, ExtractedFieldModel, ProcessingEventModel

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database tables created.")
