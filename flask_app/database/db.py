from sqlalchemy import create_engine, Column, Integer, BigInteger, String, ForeignKey, DateTime, Text
from datetime import datetime, timezone
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, joinedload

DB_NAME = "tarea2"
DB_USERNAME = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306

DATABASE_URL = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args={"charset": "utf8mb4"})
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

# --- Models ---
class Region(Base):
    __tablename__ = 'region'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)

    comunas = relationship('Comuna', back_populates='region')

class Comuna(Base):
    __tablename__ = 'comuna'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey('region.id'), nullable=False, index=True)

    region = relationship('Region', back_populates='comunas')
    voluntarios = relationship('Voluntario', back_populates='comuna')

class Voluntario(Base):
    __tablename__ = 'voluntario'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(80), nullable=False)
    telefono = Column(String(15), nullable=False)
    fecha_registro = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
    comuna_id = Column(Integer, ForeignKey('comuna.id'), nullable=False, index=True)

    comuna = relationship('Comuna', back_populates='voluntarios')
    avistamientos = relationship('Avistamiento', back_populates='voluntario')

class Ave(Base):
    __tablename__ = 'ave'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(80), nullable=False)

    avistamientos = relationship('Avistamiento', back_populates='ave')

class Avistamiento(Base):
    __tablename__ = 'avistamiento'

    id = Column(Integer, primary_key=True, autoincrement=True)
    voluntario_id = Column(Integer, ForeignKey('voluntario.id'), nullable=False, index=True)
    ave_id = Column(Integer, ForeignKey('ave.id'), nullable=False, index=True)
    fecha_hora = Column(DateTime, nullable=False)
    lugar = Column(String(200), nullable=False)
    descripcion = Column(Text(500), nullable=False)

    voluntario = relationship('Voluntario', back_populates='avistamientos')
    ave = relationship('Ave', back_populates='avistamientos')
    registros = relationship('Registro', back_populates='avistamiento')

class Registro(Base):
    __tablename__ = 'registro'

    id = Column(Integer, primary_key=True, autoincrement=True)
    ruta_archivo = Column(String(200), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    avistamiento_id = Column(Integer, ForeignKey('avistamiento.id'), nullable=False, index=True)

    avistamiento = relationship('Avistamiento', back_populates='registros')

# --- querys ---

def get_voluntario_by_id(voluntario_id):
  session = SessionLocal()
  voluntario = (
      session.query(Voluntario).filter_by(id=voluntario_id).first()
  )
  session.close()
  return voluntario

def get_voluntario_by_email(email):
  session = SessionLocal()
  voluntario = session.query(Voluntario).filter_by(email=email).first()
  session.close()
  return voluntario

def get_avistamientos(limit=10):
  session = SessionLocal()
  avistamientos = (
      session.query(Avistamiento)
      .options(joinedload(Avistamiento.ave))
      .order_by(Avistamiento.id.desc())
      .limit(limit)
      .all()
  )
  session.close()
  return avistamientos

def get_comunas_by_region(region_id):
  session = SessionLocal()
  comunas = session.query(Comuna).filter_by(region_id=region_id).all()
  session.close()
  return comunas

def get_avistamientos_paginados(pagina=1, por_pagina=5, filtro_tipo='todos', orden='fecha-desc'):
  session = SessionLocal()
  query = session.query(Avistamiento)

  if filtro_tipo and filtro_tipo != 'todos':
      if str(filtro_tipo).isdigit():
        query = query.filter(Avistamiento.ave_id == int(filtro_tipo))
      else:
        query = query.join(Avistamiento.ave).filter(
          Ave.nombre == filtro_tipo
        )

  if orden == 'fecha-asc':
      query = query.order_by(Avistamiento.fecha_hora.asc())
  elif orden == 'lugar-asc':
      query = query.order_by(Avistamiento.lugar.asc())
  elif orden == 'lugar-desc':
      query = query.order_by(Avistamiento.lugar.desc())
  else: 
      query = query.order_by(Avistamiento.fecha_hora.desc())

  total_registros = query.count()
  total_paginas = (
    total_registros + por_pagina - 1
  ) // por_pagina if total_registros > 0 else 1

  offset = (pagina - 1) * por_pagina

  avistamientos = (
    query.options(
        joinedload(Avistamiento.voluntario),
        joinedload(Avistamiento.ave),
        joinedload(Avistamiento.registros),
    )
    .offset(offset)
    .limit(por_pagina)
    .all())
  return avistamientos, total_paginas
# -- db-related functions --

def create_voluntario(username, email, phone, comuna_id):
  session = SessionLocal()
  utcnow = datetime.now(timezone.utc)
  new_voluntario = Voluntario(
      nombre=username,
      email=email,
      telefono=phone,
      comuna_id=int(comuna_id),
      fecha_registro=utcnow,
  )
  session.add(new_voluntario)
  session.commit()
  session.close()

def register_voluntario(username, email, phone, comuna_id):
  if get_voluntario_by_email(email) is not None:
    return False, 'El correo electrónico ya está registrado.'

  create_voluntario(username, email, phone, comuna_id)
  return True, 'Voluntario registrado con éxito.'

def create_avistamiento(voluntario_id, ave_id, fecha_hora, lugar, descripcion):
  session = SessionLocal()
  new_avistamiento = Avistamiento(
      voluntario_id=voluntario_id,
      ave_id=ave_id,
      lugar=lugar,
      descripcion=descripcion,
      fecha_hora=fecha_hora,
  )
  session.add(new_avistamiento)
  session.commit()
  session.refresh(new_avistamiento)
  avistamiento_id = new_avistamiento.id
  session.close()
  return avistamiento_id

def create_registro(ruta_archivo, nombre_archivo, avistamiento_id):
  session = SessionLocal()
  new_registro = Registro(
      ruta_archivo=ruta_archivo,
      nombre_archivo=nombre_archivo,
      avistamiento_id=avistamiento_id,
  )
  session.add(new_registro)
  session.commit()
  session.close()

def get_all_regiones():
  session = SessionLocal()
  regiones = session.query(Region).all()
  session.close()
  return regiones

def get_all_aves():
  session = SessionLocal()
  aves = session.query(Ave).all()
  session.close()
  return aves

def get_all_voluntarios():
  session = SessionLocal()
  voluntarios = session.query(Voluntario).order_by(Voluntario.nombre).all()
  session.close()
  return voluntarios