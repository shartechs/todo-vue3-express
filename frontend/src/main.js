import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

// Optional options for Toastification
const options = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
}

app.use(router)

// Then, use Toast with the options
app.use(Toast, options)

app.mount('#app')
