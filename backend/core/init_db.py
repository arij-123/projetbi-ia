from backend.core.database import engine, Base
import backend.models.models  # IMPORTANT: load all models

def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    init_db()