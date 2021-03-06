var path = require('path')
var fs = require('fs')

//sentencias SQL
const sqlTime = "SELECT VERSION() as version, CURRENT_TIMESTAMP as ct, CONCAT(CURRENT_DATE, ' ', CURRENT_TIME) as str_ct"

module.exports = {
    template: fs.readFileSync(path.join(__dirname, 'index.html'), { encoding: 'utf-8'}),
    props: {
        data: Array,
        session: Object
    },
    data () {
        return {
            tiempo_creacion: ""
        }
    },
    methods: {
        cout (frase, color) {
            // Para tener un buen rendimiento no se usa los Vue data
            try{
                if(arguments.length < 2){
                    document.getElementById('syncSalida').innerHTML += frase + "\n"
                }else{
                    document.getElementById('syncSalida').innerHTML += `<span style="color: ${color}">${frase}</span>` + "\n"
                }
            }catch(error){
                document.getElementById('syncSalida').innerHTML += `<span class="danger">Error: ${error.message}</span>` + "\n"
            }
        },
        testConnect () {
            // testear conexion
            // generar tiempo de creacion
            DB.query(sqlTime, (error, results, fields) => {
                if (error){
                    this.cout('Error: error desde la base de datos, error al testear la conexion', 'red')
                    throw error
                }
                this.tiempo_creacion = results[0].str_ct
                this.cout(`Conexion con Mysql, version : ${results[0].version}`, "green")
                this.cout(results[0].str_ct)
                
            })
        },
        sync () {
            // sincronizar con base de datos
            if(this.tiempo_creacion !== ""){
                
                this.insertarFacilitadores()
            }
        },

        // eventos para sincronizar
        insertarBeneficiarios () {
            // crear sentencias para insertar cuidadores
            var sqlBeneficiarios = []
            for(var i in this.data){
                var fila = this.data[i]
                var b = {
                    nombre: fila[csvClaves.beneficiario.nombre],
                    codigo: fila[csvClaves.beneficiario.codigo],
                    sexo: fila[csvClaves.beneficiario.sexo],
                    fechaRegistro: fechaFormat(fila[csvClaves.beneficiario.fechaRegistro]),
                    tipoBeneficiario: fila[csvClaves.beneficiario.tipoBeneficiario],
                    dni: fila[csvClaves.beneficiario.dni],
                    seguro: fila[csvClaves.beneficiario.seguro],
                    numeroSeguro: fila[csvClaves.beneficiario.numeroSeguro],
                    fechaNacimiento: fechaFormat(fila[csvClaves.beneficiario.fechaNacimiento]),
                    activo: 0,
                    creacion: this.tiempo_creacion,
                    edicion: this.tiempo_creacion,
                    usuarios_id: this.session.id,
                    codigoCuidador: fila[csvClaves.cuidador.codigo],
                }
                if(typeof sqlBeneficiarios[fila[csvClaves.beneficiario.codigo]] === 'undefined'){
                    sqlBeneficiarios[fila[csvClaves.cuidador.codigo]] = 
                        `
                        ('${b.nombre}', '${b.codigo}', '${b.sexo}', '${b.fechaRegistro}', '${b.tipoBeneficiario}', '${b.dni}', '${b.seguro}', '${b.numeroSeguro}', '${b.fechaNacimiento}', '${b.creacion}', '${b.edicion}', '${b.usuarios_id}', '${b.codigoCuidador}'),`
                }
            }
            sql = "INSERT INTO `latigazo`.`beneficiarios` "
            sql += "(`nombre`, `codigo`, `sexo`, `fechaRegistro`, `tipoBeneficiario`, `dni`, `seguro`, `numeroSeguro`, `fechaNacimiento`, `creacion`, `edicion`, `usuarios_id`, `codigoCuidador`) VALUES "
            for(var i in sqlBeneficiarios){
                sql += sqlBeneficiarios[i]
            }
            sql = sql.substring(0, sql.length - 1) + ";"

            // insertar en la base de datos
            // console.log(sql)
            DB.query(sql, (error, results, fields) => {
                if (error){
                    this.cout('Error: error desde la base de datos, error al insertar Beneficiarios', 'red')
                    throw error
                }
                this.cout('Beneficiarios insertados', 'green')
                this.cout('Base de datos sincronizada con exito!', 'blue')
                
            })
        },
        insertarCuidadores () {
            // crear sentencias para insertar cuidadores
            var sqlCuidadores = []
            for(var i in this.data){
                var fila = this.data[i]
                var c = {
                    nombre: fila[csvClaves.cuidador.nombre],
                    codigo: fila[csvClaves.cuidador.codigo],
                    sexo: fila[csvClaves.cuidador.sexo],
                    parentesco: fila[csvClaves.cuidador.parentesco],
                    dni: fila[csvClaves.cuidador.dni],
                    seguro: fila[csvClaves.cuidador.tipoSeguro],
                    fechaNacimiento: fechaFormat(fila[csvClaves.cuidador.fechaNacimiento]),
                    fechaRegistro: fechaFormat(fila[csvClaves.cuidador.fechaRegistro]),
                    creacion: this.tiempo_creacion,
                    edicion: this.tiempo_creacion,
                    usuarios_id: this.session.id,
                    codigoFacilitador: fila[csvClaves.facilitador.codigo]
                }
                if(typeof sqlCuidadores[fila[csvClaves.cuidador.codigo]] === 'undefined'){
                    sqlCuidadores[fila[csvClaves.cuidador.codigo]] = 
                        `
                        ('${c.nombre}', '${c.codigo}', '${c.sexo}', '${c.parentesco}', '${c.dni}', '${c.seguro}', '${c.fechaNacimiento}', '${c.fechaRegistro}', '${c.creacion}', '${c.edicion}', '${c.usuarios_id}', '${c.codigoFacilitador}'),`
                }
            }
            sql = "INSERT INTO `latigazo`.`cuidadores` "
            sql += "(`nombre`, `codigo`, `sexo`, `parentesco`, `dni`, `seguro`, `fechaNacimiento`, `fechaRegistro`, `creacion`, `edicion`, `usuarios_id`, `codigoFacilitador`) VALUES "
            for(var i in sqlCuidadores){
                sql += sqlCuidadores[i]
            }
            sql = sql.substring(0, sql.length - 1) + ";"

            // insertar en la base de datos
            // console.log(sql)
            DB.query(sql, (error, results, fields) => {
                if (error){
                    this.cout('Error: error desde la base de datos, error al insertar cuidadores', 'red')
                    throw error
                }
                this.cout('Cuidadores insertados', 'green')
                this.insertarBeneficiarios()
            })
        },
        insertarFacilitadores (){
            // generar sentencia sql
            var sqlFacilitadores = []
            for(var i in this.data){
                var fila = this.data[i]

                //generar ubicacion
                var ubicacion = {}
                for(var j in csvClaves.ubicacion){
                    ubicacion[j] = fila[csvClaves.ubicacion[j]]
                }

                // generar objeto para insertarlo
                var f = {
                    codigoFamilia: fila[csvClaves.facilitador.codigoFamilia],
                    codigo: fila[csvClaves.facilitador.codigo],
                    nombre: fila[csvClaves.facilitador.nombre],
                    ubicacion: JSON.stringify(ubicacion),
                    creacion: this.tiempo_creacion,
                    edicion: this.tiempo_creacion,
                    usuarios_id: this.session.id
                }

                if(typeof sqlFacilitadores[f.codigo] === 'undefined'){
                    sqlFacilitadores[f.codigo] = 
                        `
                        ('${f.codigoFamilia}', 
                        '${f.codigo}', 
                        '${f.nombre}', 
                        '${f.ubicacion}', 
                        '${f.creacion}', 
                        '${f.edicion}', 
                        '${f.usuarios_id}')`
                }
            }
            var sql = "INSERT INTO `latigazo`.`facilitadores` (`codigoFamilia`, `codigo`, `nombre`, `ubicacion`, `creacion`, `edicion`, `usuarios_id`) VALUES "
            for(var i in sqlFacilitadores){
                sql += `${sqlFacilitadores[i]},`
            }
            sql = sql.substring(0, sql.length - 1) + ";"
            
            // insertar en la base de datos
            // console.log(sql)
            DB.query(sql, (error, results, fields) => {
                if (error){
                    this.cout('Error: error desde la base de datos, error al insertar facilitadores', 'red')
                    throw error
                }
                this.cout('Facilitadores insertados', 'green')
                this.insertarCuidadores()
            })
        }
    },
    mounted () {
        // DB.connect()
        this.cout('Conexion abierta')
        this.testConnect()
    }
}