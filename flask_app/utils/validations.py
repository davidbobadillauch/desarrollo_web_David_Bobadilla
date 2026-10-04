from datetime import date, datetime
import re
import filetype

def validate_name(value):
    return value and len(value) > 3 and len(value.strip()) < 255

def validate_email(value):
    likeEmail = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(likeEmail, value.strip())

def validate_phone(value):
    likePhone = r'^\+?[0-9]{8}$'
    return re.match(likePhone, value.strip())

def validate_id(value):
    return value

def validate_place(value):
    return value and len(value) > 3 and len(value.strip()) < 200

def validate_description(value):
    return value and len(value.strip()) < 500

def validate_date(value):
    if isinstance(value, str):
        try:
            value = datetime.strptime(value.strip(), '%Y-%m-%dT%H:%M').date()
        except ValueError:
            return False
    return value and value <= date.today()

def validate_file(value):
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", ".mp4", ".webm", ".mov", ".avi", ".mkv"}
    ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"}

    if value is None:
        return False

    if value.filename == "":
        return False

    ftype_guess = filetype.guess(value)
    if ftype_guess.extension not in ALLOWED_EXTENSIONS:
        return False
    if ftype_guess.mime not in ALLOWED_MIMETYPES:
        return False
    return True

def validate_volunteer_user(name, email, phone, comuna_id):
    return validate_name(name) and validate_email(email) and validate_phone(phone) and validate_id(comuna_id)

def validate_sighting(volunteer_id, bird_id, fecha_hora, lugar, descripcion):
    return validate_id(volunteer_id) and validate_id(bird_id) and validate_date(fecha_hora) and validate_place(lugar) and validate_description(descripcion)

def validate_register_file(file):
    return validate_file(file)