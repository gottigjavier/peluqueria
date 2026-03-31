from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.models import ResourceType, ServiceCategory, AppointmentStatus


class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


class ClientResponse(ClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ServiceBase(BaseModel):
    name: str
    category: ServiceCategory
    duration_minutes: int
    price: float
    description: Optional[str] = None
    required_resource_type: Optional[ResourceType] = None


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[ServiceCategory] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None
    required_resource_type: Optional[ResourceType] = None
    is_active: Optional[bool] = None


class ServiceResponse(ServiceBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class ResourceBase(BaseModel):
    name: str
    resource_type: ResourceType
    location: Optional[str] = None


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    resource_type: Optional[ResourceType] = None
    is_available: Optional[bool] = None
    location: Optional[str] = None


class ResourceResponse(ResourceBase):
    id: int
    is_available: bool

    class Config:
        from_attributes = True


class ProfessionalBase(BaseModel):
    name: str
    specialty: Optional[str] = None


class ProfessionalCreate(ProfessionalBase):
    pass


class ProfessionalUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    is_active: Optional[bool] = None


class ProfessionalResponse(ProfessionalBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


class AppointmentBase(BaseModel):
    client_id: int
    service_id: int
    professional_id: int
    resource_id: Optional[int] = None
    start_time: datetime
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    client_id: Optional[int] = None
    service_id: Optional[int] = None
    professional_id: Optional[int] = None
    resource_id: Optional[int] = None
    start_time: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    end_time: datetime
    status: AppointmentStatus
    price: Optional[float] = None

    class Config:
        from_attributes = True


class AppointmentDetailResponse(AppointmentResponse):
    client: ClientResponse
    service: ServiceResponse
    professional: ProfessionalResponse
    resource: ResourceResponse


class BeforeAfterPhotoBase(BaseModel):
    appointment_id: int
    photo_url: str
    photo_type: str
    description: Optional[str] = None


class BeforeAfterPhotoCreate(BeforeAfterPhotoBase):
    pass


class BeforeAfterPhotoResponse(BeforeAfterPhotoBase):
    id: int

    class Config:
        from_attributes = True


class InventoryLogBase(BaseModel):
    product_name: str
    quantity_used: float
    unit: str
    appointment_id: int


class InventoryLogCreate(InventoryLogBase):
    pass


class InventoryLogResponse(InventoryLogBase):
    id: int

    class Config:
        from_attributes = True


class AvailabilityRequest(BaseModel):
    professional_id: int
    resource_type: ResourceType
    date: datetime
    duration_minutes: int


class AvailabilityResponse(BaseModel):
    available_slots: list[datetime]
    available_resources: list[ResourceResponse]
    available_professionals: list[ProfessionalResponse]
