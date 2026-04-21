from backend.core.database import SessionLocal
from backend.models.models import User
from backend.core.security import hash_password

def create_admin():
    db = SessionLocal()

    existing = db.query(User).filter(User.email == "admin@gmail.com").first()

    if existing:
        print("Admin already exists")
        return

    admin = User(
        first_name="Admin",
        last_name="System",
        email="admin@gmail.com",
        password_hash=hash_password("admin123"),
        role="admin"
    )

    db.add(admin)
    db.commit()
    db.close()

    print("✅ Admin created successfully!")

if __name__ == "__main__":
    create_admin()