var initCartilla = {
    fecha: "",
    hora: "",
    familia: "",
    edad: "",
    semana: "",
    objetivos: [
        {
            titulo: "VIDA EN FAMILIA",
            numero: "",
            descripcion: "",
        },
        {
            titulo: "JUGANDO APRENDO",
            numero: "",
            descripcion: "",
        },
        {
            titulo: "CUENTAME UN CUENTO",
            numero: "",
            descripcion: "",
        }
    ],
    semana: 0
}
var initTemp = {
    logros: []
}

module.exports = {
    template: fs.readFileSync(path.join(__dirname, 'index.html'), { encoding: 'utf-8'}),
    components: {
        'ficha': require('../ficha')
    },
    data () {
        return {
            cartilla: initCartilla,
            fichas: [],
            buscar: new String(""),
            enviado: false,
            tempListDescripcion: initTemp
        }
    },
    props: {
        csvClaves: {
            required: true
        },
        detalles: {
            required: true
        }
    },
    created () {
        this.cartilla.familia = this.detalles[this.csvClaves.facilitador.codigoFamilia]
        this.cartilla.edad = this.detalles.edad.str
        this.cartilla.semana = this.detalles.edad.semanas
        this.fichas = require(__dirRoot + config.dirFichas)
    },
    computed: {
        fichasBuscar () {
            return this.fichas.filter( item => {
                return item.titulo.toLowerCase().indexOf(this.buscar.toLowerCase()) > -1
            })
        },
        fichasSugeridas () {
            return this.fichas.filter( item => {
                // return item.titulo.toLowerCase().indexOf(this.buscar.toLowerCase()) > -1
                var mes = Math.floor(this.cartilla.semana/4)
                return (item.semana > mes*4 && item.semana < (mes+1)*4)
            })
        }
    },
    methods: {
        buscarFicha (numero) {
            return this.fichas.filter( item => {
                return item.numero == numero
            })[0]
        },
        definirFicha(objetivo){
            objetivo.descripcion = ""
            this.tempListDescripcion = initTemp
            this.tempListDescripcion = this.buscarFicha(objetivo.numero)
        },
        enviarACronograma () {
            // ver('enviando', this.cartilla)
            this.enviado = true
            this.$emit('enviar', JSON.stringify(this.cartilla))
        }
    }
}