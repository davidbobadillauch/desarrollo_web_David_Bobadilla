from flask import Flask, request, render_template, redirect, url_for, session
from utils.validations import validate_volunteer_user, validate_sighting, validate_register_file
import database.db as db
from werkzeug.utils import secure_filename
import hashlib
import filetype
import os

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
app.secret_key= 'lacl3sup3rs3cr3t3'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000

@app.route('/')
def portada():
    ultimos = db.get_avistamientos(limit=2)
    return render_template('portada.html', ultimos_avistamientos=ultimos)

@app.route('/voluntarios', methods=['GET', 'POST'])
def registrar_voluntario():
    comunas = []
    if request.method == 'POST':
        username = request.form.get('nombre')
        email = request.form.get('correo')
        phone = request.form.get('numero')
        comuna_id = request.form.get('comuna_id')
        region_id = request.form.get('region_id')
        error1 = 'la validación fallo'
        if validate_volunteer_user(username, email, phone, comuna_id):
            status = db.register_voluntario(username, email, phone, comuna_id)
            if status:
                session["user"] = username
                return redirect(url_for("portada"))
        print(error1)

        regiones = db.get_all_regiones()
        if region_id:
            comunas = db.get_comunas_by_region(int(region_id))
        return render_template("voluntarios.html", error=error1, regiones=regiones, comunas=comunas)
    
    elif request.method == 'GET':
        regiones = db.get_all_regiones()
        comunas = db.get_comunas_by_region(regiones[0].id) if regiones else []
        return render_template("voluntarios.html", regiones=regiones, comunas=comunas)

@app.route('/get_comunas/<int:region_id>')
def get_comunas(region_id):
    comunas = db.get_comunas_by_region(region_id)
    return render_template('comunas_options.html', comunas=comunas)
            
@app.route('/registrar_avistamiento', methods=['GET', 'POST'])
def registrar_avistamiento():
    if request.method == 'POST':
        voluntario_id = request.form.get('voluntario_id')
        ave_id = request.form.get('ave_id')
        fecha_hora = request.form.get('fecha_hora')
        lugar = request.form.get('lugar')
        descripcion = request.form.get('descripcion')
        archivo = request.files.get('archivo')
        error = ""

        if validate_sighting(voluntario_id, ave_id, fecha_hora, lugar, descripcion):
            avistamiento_id = db.create_avistamiento(voluntario_id, ave_id, fecha_hora, lugar, descripcion)
            if not avistamiento_id:
                error = "Error al crear el avistamiento."
                voluntarios = db.get_all_voluntarios()
                aves = db.get_all_aves()
                return render_template('registrar_avistamiento.html', aves=aves, voluntarios=voluntarios, error=error)

            if archivo and archivo.filename != '':
                is_valid_file = validate_register_file(archivo)
                if not is_valid_file:
                    return redirect(url_for('listado_avistamientos'))
            
                _filename = hashlib.sha256(
                    secure_filename(archivo.filename) 
                    .encode("utf-8") 
                    ).hexdigest()
                _extension = filetype.guess(archivo).extension
                arch_filename = f"{_filename}.{_extension}"

                ruta_completa = os.path.join(app.config['UPLOAD_FOLDER'], arch_filename)
                ruta_bd = f'uploads/{arch_filename}'.replace('\\', '/')
                archivo.save(ruta_completa)
                db.create_registro(ruta_bd, arch_filename, avistamiento_id)

                return redirect(url_for('listado_avistamientos'))
        print("registro fallo")

    elif request.method == 'GET':  
        voluntarios = db.get_all_voluntarios()
        aves = db.get_all_aves()
        return render_template('registrar_avistamiento.html', aves=aves, voluntarios=voluntarios)
            
@app.route('/listado_avistamiento')
def listado_avistamientos():
    pagina = request.args.get('page', 1, type=int)
    filtro_tipo = request.args.get('tipo', 'todos')
    orden = request.args.get('orden', 'fecha-desc')
    por_pagina = 5
    avistamientos, total_paginas = db.get_avistamientos_paginados(pagina=pagina, por_pagina=por_pagina, filtro_tipo=filtro_tipo, orden=orden)
    aves = db.get_all_aves()
    return render_template('listado_avistamiento.html', avistamientos=avistamientos, pagina=pagina, total_paginas=total_paginas, tipos_aves=aves)


if __name__ == '__main__':
    app.run(debug=True, port=5000)