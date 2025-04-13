import { createApp } from 'vue'
import App from './App.vue'
import Vue3ExcelEditor from "vue3-excel-editor";

import './index.css'

const app = createApp(App)
app.use(Vue3ExcelEditor)

app.mount('#app')