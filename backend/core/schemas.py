from pydantic import BaseModel
from typing import Optional

class UserRegister(BaseModel):
    first_name: str
    last_name: str

    age: Optional[int] = None
    phone: Optional[str] = None

    city: Optional[str] = None
    location: Optional[str] = None

    email: str
    password: str

    role: str = "user"
    image: Optional[str] = None


from pydantic import BaseModel

class UserLogin(BaseModel):
    email: str
    password: str