from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.services import services
from app.schemas.schemas import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
    ResourceCreate,
    ResourceUpdate,
    ResourceResponse,
    ProfessionalCreate,
    ProfessionalUpdate,
    ProfessionalResponse,
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentDetailResponse,
    BeforeAfterPhotoCreate,
    BeforeAfterPhotoResponse,
    InventoryLogCreate,
    InventoryLogResponse,
    ResourceType,
)
from datetime import datetime

router = APIRouter()


@router.post(
    "/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED
)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    return services.create_client(db, client)


@router.get("/clients", response_model=list[ClientResponse])
def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_clients(db, skip, limit)


@router.get("/clients/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = services.get_client_by_id(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/clients/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client: ClientUpdate, db: Session = Depends(get_db)):
    updated = services.update_client(db, client_id, client)
    if not updated:
        raise HTTPException(status_code=404, detail="Client not found")
    return updated


@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    if not services.delete_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")


@router.post(
    "/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED
)
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    return services.create_service(db, service)


@router.get("/services", response_model=list[ServiceResponse])
def get_services(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return services.get_services(db, skip, limit, category)


@router.get("/services/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = services.get_service_by_id(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.put("/services/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int, service: ServiceUpdate, db: Session = Depends(get_db)
):
    updated = services.update_service(db, service_id, service)
    if not updated:
        raise HTTPException(status_code=404, detail="Service not found")
    return updated


@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: int, db: Session = Depends(get_db)):
    if not services.delete_service(db, service_id):
        raise HTTPException(status_code=404, detail="Service not found")


@router.post(
    "/resources", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED
)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    return services.create_resource(db, resource)


@router.get("/resources", response_model=list[ResourceResponse])
def get_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_resources(db, skip, limit)


@router.get("/resources/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = services.get_resource_by_id(db, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.put("/resources/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: int, resource: ResourceUpdate, db: Session = Depends(get_db)
):
    updated = services.update_resource(db, resource_id, resource)
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    return updated


@router.post(
    "/professionals",
    response_model=ProfessionalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_professional(
    professional: ProfessionalCreate, db: Session = Depends(get_db)
):
    return services.create_professional(db, professional)


@router.get("/professionals", response_model=list[ProfessionalResponse])
def get_professionals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_professionals(db, skip, limit)


@router.get("/professionals/{professional_id}", response_model=ProfessionalResponse)
def get_professional(professional_id: int, db: Session = Depends(get_db)):
    professional = services.get_professional_by_id(db, professional_id)
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional


@router.put("/professionals/{professional_id}", response_model=ProfessionalResponse)
def update_professional(
    professional_id: int,
    professional: ProfessionalUpdate,
    db: Session = Depends(get_db),
):
    updated = services.update_professional(db, professional_id, professional)
    if not updated:
        raise HTTPException(status_code=404, detail="Professional not found")
    return updated


@router.post(
    "/appointments",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    created = services.create_appointment(db, appointment)
    if not created:
        raise HTTPException(
            status_code=409, detail="No available slot for this appointment"
        )
    return created


@router.get("/appointments", response_model=list[AppointmentResponse])
def get_appointments(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    professional_id: Optional[int] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return services.get_appointments(
        db, skip, limit, start_date, end_date, professional_id, client_id
    )


@router.get("/appointments/{appointment_id}", response_model=AppointmentDetailResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = services.get_appointment_by_id(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.put("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int, appointment: AppointmentUpdate, db: Session = Depends(get_db)
):
    updated = services.update_appointment(db, appointment_id, appointment)
    if not updated:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated


@router.delete("/appointments/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db)):
    if not services.cancel_appointment(db, appointment_id):
        raise HTTPException(status_code=404, detail="Appointment not found")


@router.post(
    "/appointments/{appointment_id}/complete", response_model=AppointmentResponse
)
def complete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    completed = services.complete_appointment(db, appointment_id)
    if not completed:
        raise HTTPException(status_code=404, detail="Appointment not found")

    service = services.get_service_by_id(db, completed.service_id)
    completed.price = service.price if service else 0

    return completed


@router.post(
    "/before-after-photos",
    response_model=BeforeAfterPhotoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_before_after_photo(
    photo: BeforeAfterPhotoCreate, db: Session = Depends(get_db)
):
    return services.add_before_after_photo(db, photo.model_dump())


@router.get(
    "/before-after-photos/appointment/{appointment_id}",
    response_model=list[BeforeAfterPhotoResponse],
)
def get_appointment_photos(appointment_id: int, db: Session = Depends(get_db)):
    from app.models.models import BeforeAfterPhoto

    return (
        db.query(BeforeAfterPhoto)
        .filter(BeforeAfterPhoto.appointment_id == appointment_id)
        .all()
    )


@router.post(
    "/inventory-logs",
    response_model=InventoryLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inventory_log(log: InventoryLogCreate, db: Session = Depends(get_db)):
    return services.add_inventory_log(db, log.model_dump())


@router.get("/availability", response_model=dict)
def check_availability(
    professional_id: int,
    resource_type: ResourceType,
    start_time: datetime,
    duration_minutes: int,
    gap_minutes: int = 15,
    db: Session = Depends(get_db),
):
    return services.check_availability(
        db,
        professional_id,
        resource_type.value,
        start_time,
        duration_minutes,
        gap_minutes,
    )


@router.get("/availability/multi-lock", response_model=dict)
def check_multi_lock_availability(
    resource_type: ResourceType,
    start_time: datetime,
    duration_minutes: int,
    gap_minutes: int = 15,
    professional_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return services.check_multi_lock_availability(
        db,
        resource_type.value,
        start_time,
        duration_minutes,
        gap_minutes,
        professional_id,
    )
