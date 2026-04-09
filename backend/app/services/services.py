from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from typing import Optional
from app.models.models import (
    Client,
    Service,
    Resource,
    Professional,
    Appointment,
    InventoryLog,
    BeforeAfterPhoto,
    AppointmentStatus,
    ResourceType,
)
from app.schemas.schemas import (
    ClientCreate,
    ClientUpdate,
    ServiceCreate,
    ServiceUpdate,
    ResourceCreate,
    ResourceUpdate,
    ProfessionalCreate,
    ProfessionalUpdate,
    AppointmentCreate,
    AppointmentUpdate,
)


def create_client(db: Session, client: ClientCreate) -> Client:
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


def get_clients(db: Session, skip: int = 0, limit: int = 100) -> list[Client]:
    return db.query(Client).offset(skip).limit(limit).all()


def get_client_by_id(db: Session, client_id: int) -> Optional[Client]:
    return db.query(Client).filter(Client.id == client_id).first()


def update_client(
    db: Session, client_id: int, client: ClientUpdate
) -> Optional[Client]:
    db_client = get_client_by_id(db, client_id)
    if db_client:
        for key, value in client.model_dump(exclude_unset=True).items():
            setattr(db_client, key, value)
        db.commit()
        db.refresh(db_client)
    return db_client


def delete_client(db: Session, client_id: int) -> bool:
    db_client = get_client_by_id(db, client_id)
    if db_client:
        db.delete(db_client)
        db.commit()
        return True
    return False


def create_service(db: Session, service: ServiceCreate) -> Service:
    db_service = Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def get_services(
    db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None
) -> list[Service]:
    query = db.query(Service).filter(Service.is_active == True)
    if category:
        query = query.filter(Service.category == category)
    return query.offset(skip).limit(limit).all()


def get_service_by_id(db: Session, service_id: int) -> Optional[Service]:
    return db.query(Service).filter(Service.id == service_id).first()


def update_service(
    db: Session, service_id: int, service: ServiceUpdate
) -> Optional[Service]:
    db_service = get_service_by_id(db, service_id)
    if db_service:
        for key, value in service.model_dump(exclude_unset=True).items():
            setattr(db_service, key, value)
        db.commit()
        db.refresh(db_service)
    return db_service


def delete_service(db: Session, service_id: int) -> bool:
    db_service = get_service_by_id(db, service_id)
    if db_service:
        db_service.is_active = False
        db.commit()
        return True
    return False


def create_resource(db: Session, resource: ResourceCreate) -> Resource:
    db_resource = Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource


def get_resources(db: Session, skip: int = 0, limit: int = 100) -> list[Resource]:
    return db.query(Resource).offset(skip).limit(limit).all()


def get_resource_by_id(db: Session, resource_id: int) -> Optional[Resource]:
    return db.query(Resource).filter(Resource.id == resource_id).first()


def update_resource(
    db: Session, resource_id: int, resource: ResourceUpdate
) -> Optional[Resource]:
    db_resource = get_resource_by_id(db, resource_id)
    if db_resource:
        for key, value in resource.model_dump(exclude_unset=True).items():
            setattr(db_resource, key, value)
        db.commit()
        db.refresh(db_resource)
    return db_resource


def create_professional(db: Session, professional: ProfessionalCreate) -> Professional:
    db_professional = Professional(**professional.model_dump())
    db.add(db_professional)
    db.commit()
    db.refresh(db_professional)
    return db_professional


def get_professionals(
    db: Session, skip: int = 0, limit: int = 100
) -> list[Professional]:
    return (
        db.query(Professional)
        .filter(Professional.is_active == True)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_professional_by_id(db: Session, professional_id: int) -> Optional[Professional]:
    return db.query(Professional).filter(Professional.id == professional_id).first()


def update_professional(
    db: Session, professional_id: int, professional: ProfessionalUpdate
) -> Optional[Professional]:
    db_professional = get_professional_by_id(db, professional_id)
    if db_professional:
        for key, value in professional.model_dump(exclude_unset=True).items():
            setattr(db_professional, key, value)
        db.commit()
        db.refresh(db_professional)
    return db_professional


def check_availability(
    db: Session,
    professional_id: int,
    resource_type: str,
    start_time: datetime,
    duration_minutes: int,
    gap_minutes: int = 0,
    exclude_appointment_id: Optional[int] = None,
    service_id: Optional[int] = None,
) -> dict:
    end_time = start_time + timedelta(minutes=duration_minutes)

    query = db.query(Appointment).filter(
        Appointment.professional_id == professional_id,
        Appointment.status.in_(
            [
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.IN_PROGRESS,
            ]
        ),
        or_(and_(Appointment.start_time < end_time, Appointment.end_time > start_time)),
    )

    if exclude_appointment_id:
        query = query.filter(Appointment.id != exclude_appointment_id)

    professional_busy = query.first() is not None

    service_available = True
    if service_id:
        service = get_service_by_id(db, service_id)
        service_available = service.is_active if service else False

    professional_available = not professional_busy

    all_resources = (
        db.query(Resource)
        .filter(Resource.resource_type == ResourceType(resource_type))
        .all()
    )

    available_resources = []
    for resource in all_resources:
        resource_query = db.query(Appointment).filter(
            Appointment.resource_id == resource.id,
            Appointment.status.in_(
                [
                    AppointmentStatus.PENDING,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS,
                ]
            ),
            or_(
                and_(
                    Appointment.start_time < end_time, Appointment.end_time > start_time
                )
            ),
        )
        if exclude_appointment_id:
            resource_query = resource_query.filter(
                Appointment.id != exclude_appointment_id
            )

        if not resource_query.first():
            available_resources.append(resource)

    return {
        "professional_available": not professional_busy and professional_available,
        "available_resources": [
            {
                "id": r.id,
                "name": r.name,
                "resource_type": r.resource_type.value,
                "is_available": r.is_available,
            }
            for r in available_resources
        ],
        "available_professionals": [],
        "is_available": not professional_busy
        and professional_available
        and service_available
        and len(available_resources) > 0,
    }


def check_professional_availability(
    db: Session,
    resource_type: str,
    start_time: datetime,
    duration_minutes: int,
    exclude_appointment_id: Optional[int] = None,
) -> list:
    end_time = start_time + timedelta(minutes=duration_minutes)

    all_professionals = (
        db.query(Professional).filter(Professional.is_active == True).all()
    )

    available_professionals = []
    for professional in all_professionals:
        query = db.query(Appointment).filter(
            Appointment.professional_id == professional.id,
            Appointment.status.in_(
                [
                    AppointmentStatus.PENDING,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS,
                ]
            ),
            or_(
                and_(
                    Appointment.start_time < end_time, Appointment.end_time > start_time
                )
            ),
        )
        if exclude_appointment_id:
            query = query.filter(Appointment.id != exclude_appointment_id)

        if not query.first():
            available_professionals.append(professional)

    return [
        {
            "id": p.id,
            "name": p.name,
            "specialty": p.specialty,
            "is_available": p.is_available,
        }
        for p in available_professionals
    ]


def create_appointment(
    db: Session, appointment: AppointmentCreate
) -> Optional[Appointment]:
    service = get_service_by_id(db, appointment.service_id)
    if not service:
        return None

    now = datetime.now()
    start_time = appointment.start_time

    if start_time.replace(tzinfo=None) < now.replace(tzinfo=None):
        return None

    duration = service.duration_minutes

    resource_type = (
        service.required_resource_type.value
        if service.required_resource_type
        else "chair"
    )

    availability = check_availability(
        db,
        appointment.professional_id,
        resource_type,
        start_time,
        duration,
        service_id=appointment.service_id,
    )

    if not availability["is_available"]:
        return None

    resource_id = (
        availability["available_resources"][0]["id"]
        if availability["available_resources"]
        else None
    )
    if not resource_id:
        return None

    end_time = start_time + timedelta(minutes=duration)

    db_appointment = Appointment(
        client_id=appointment.client_id,
        service_id=appointment.service_id,
        professional_id=appointment.professional_id,
        resource_id=resource_id,
        start_time=start_time,
        end_time=end_time,
        notes=appointment.notes,
        status=AppointmentStatus.PENDING,
    )

    db.add(db_appointment)
    db.flush()

    resource = get_resource_by_id(db, resource_id)
    if resource:
        resource.is_available = False

    service = get_service_by_id(db, appointment.service_id)
    if service:
        service.is_available = False

    professional = get_professional_by_id(db, appointment.professional_id)
    if professional:
        professional.is_available = False

    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def get_appointments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    professional_id: Optional[int] = None,
    client_id: Optional[int] = None,
    include_completed: bool = False,
) -> list[Appointment]:
    query = db.query(Appointment)

    if not include_completed:
        query = query.filter(
            Appointment.status.in_(
                [
                    AppointmentStatus.PENDING,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS,
                ]
            )
        )

    if start_date:
        query = query.filter(Appointment.start_time >= start_date)
    if end_date:
        query = query.filter(Appointment.start_time <= end_date)
    if professional_id:
        query = query.filter(Appointment.professional_id == professional_id)
    if client_id:
        query = query.filter(Appointment.client_id == client_id)

    return query.order_by(Appointment.start_time).offset(skip).limit(limit).all()


def get_appointment_by_id(db: Session, appointment_id: int) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def update_appointment(
    db: Session, appointment_id: int, appointment: AppointmentUpdate
) -> Optional[Appointment]:
    db_appointment = get_appointment_by_id(db, appointment_id)
    if not db_appointment:
        return None

    now = datetime.now()
    start_time = (
        appointment.start_time if appointment.start_time else db_appointment.start_time
    )

    if start_time.replace(tzinfo=None) < now.replace(tzinfo=None):
        return None

    if (
        appointment.start_time
        or appointment.service_id
        or appointment.professional_id
        or appointment.resource_id
    ):
        if appointment.service_id:
            service = get_service_by_id(db, appointment.service_id)
        else:
            service = db_appointment.service

        if service:
            duration = service.duration_minutes
            resource_type = (
                service.required_resource_type.value
                if service.required_resource_type
                else "chair"
            )

            professional_id = (
                appointment.professional_id
                if appointment.professional_id is not None
                else db_appointment.professional_id
            )
            resource_id = (
                appointment.resource_id
                if appointment.resource_id is not None
                else db_appointment.resource_id
            )

            has_professional_change = appointment.professional_id is not None
            has_resource_change = appointment.resource_id is not None

            if has_professional_change:
                temp_availability = check_availability(
                    db,
                    appointment.professional_id,
                    resource_type,
                    start_time,
                    duration,
                    exclude_appointment_id=appointment_id,
                )
                if not temp_availability["professional_available"]:
                    return None

            if has_resource_change:
                temp_availability = check_availability(
                    db,
                    professional_id,
                    resource_type,
                    start_time,
                    duration,
                    exclude_appointment_id=appointment_id,
                )
                resource_ids = [
                    r.id for r in temp_availability.get("available_resources", [])
                ]
                if appointment.resource_id not in resource_ids:
                    return None

            availability = check_availability(
                db,
                professional_id,
                resource_type,
                start_time,
                duration,
                exclude_appointment_id=appointment_id,
            )

            if not availability["professional_available"]:
                available_pros = check_professional_availability(
                    db,
                    resource_type,
                    start_time,
                    duration,
                    exclude_appointment_id=appointment_id,
                )
                if len(available_pros) > 0:
                    professional_id = available_pros[0].id
                    availability = check_availability(
                        db,
                        professional_id,
                        resource_type,
                        start_time,
                        duration,
                        exclude_appointment_id=appointment_id,
                    )
                else:
                    return None

            original_resource_id = resource_id
            resource_ids = [
                r["id"] for r in availability.get("available_resources", [])
            ]
            if resource_id not in resource_ids:
                if len(availability.get("available_resources", [])) > 0:
                    resource_id = availability["available_resources"][0]["id"]
                else:
                    return None

            db_appointment.professional_id = professional_id
            db_appointment.resource_id = resource_id
            db_appointment.end_time = start_time + timedelta(minutes=duration)

    for key, value in appointment.model_dump(exclude_unset=True).items():
        setattr(db_appointment, key, value)

    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def cancel_appointment(db: Session, appointment_id: int) -> Optional[Appointment]:
    db_appointment = get_appointment_by_id(db, appointment_id)
    if db_appointment:
        db_appointment.status = AppointmentStatus.CANCELLED

        if db_appointment.resource_id:
            resource = get_resource_by_id(db, db_appointment.resource_id)
            if resource:
                resource.is_available = True

        if db_appointment.service_id:
            service = get_service_by_id(db, db_appointment.service_id)
            if service:
                service.is_available = True

        if db_appointment.professional_id:
            professional = get_professional_by_id(db, db_appointment.professional_id)
            if professional:
                professional.is_available = True

        db.commit()
        db.refresh(db_appointment)
    return db_appointment


def start_appointment(db: Session, appointment_id: int) -> Optional[Appointment]:
    db_appointment = get_appointment_by_id(db, appointment_id)
    if db_appointment and db_appointment.status == AppointmentStatus.PENDING:
        db_appointment.status = AppointmentStatus.IN_PROGRESS

        if db_appointment.resource_id:
            resource = get_resource_by_id(db, db_appointment.resource_id)
            if resource:
                resource.is_available = False

        if db_appointment.service_id:
            service = get_service_by_id(db, db_appointment.service_id)
            if service:
                service.is_available = False

        if db_appointment.professional_id:
            professional = get_professional_by_id(db, db_appointment.professional_id)
            if professional:
                professional.is_available = False

        db.commit()
        db.refresh(db_appointment)
        return db_appointment
    return None


def complete_appointment(db: Session, appointment_id: int) -> Optional[Appointment]:
    db_appointment = get_appointment_by_id(db, appointment_id)
    if db_appointment and db_appointment.status == AppointmentStatus.IN_PROGRESS:
        db_appointment.status = AppointmentStatus.COMPLETED

        if db_appointment.resource_id:
            resource = get_resource_by_id(db, db_appointment.resource_id)
            if resource:
                resource.is_available = True

        if db_appointment.service_id:
            service = get_service_by_id(db, db_appointment.service_id)
            if service:
                service.is_available = True

        if db_appointment.professional_id:
            professional = get_professional_by_id(db, db_appointment.professional_id)
            if professional:
                professional.is_available = True

        db.commit()
        db.refresh(db_appointment)
    return db_appointment


def get_appointment_with_price(db: Session, appointment_id: int) -> Optional[dict]:
    appointment = get_appointment_by_id(db, appointment_id)
    if not appointment:
        return None

    service = get_service_by_id(db, appointment.service_id)
    return {"appointment": appointment, "price": service.price if service else 0}


def add_before_after_photo(db: Session, photo_data: dict) -> BeforeAfterPhoto:
    photo = BeforeAfterPhoto(**photo_data)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


def add_inventory_log(db: Session, log_data: dict) -> InventoryLog:
    log = InventoryLog(**log_data)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
