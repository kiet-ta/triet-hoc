from pydantic import BaseModel


class CourseStatusItem(BaseModel):
    courseCode: str
    isSuspended: bool
    message: str | None = None


class CourseStatusUpdate(BaseModel):
    isSuspended: bool
    message: str | None = None
