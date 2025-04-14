<template>
  <div class="container mx-auto p-4">
    <div v-if="!isLoggedIn" class="max-w-md mx-auto">
      <h1 class="text-2xl mb-4">SQLite Database Manager</h1>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <input
          v-model="dbName"
          placeholder="Database name"
          class="w-full mb-3 p-2 border rounded"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full mb-3 p-2 border rounded"
        />
        <button
          @click="login"
          class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
      <div v-if="randomNum" class="mt-4 p-4 bg-green-100 rounded">
        Initial random number: {{ randomNum }}
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-xl">Database: {{ dbName }}</h2>
        <button
          @click="logout"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div v-if="!selectedTable" class="grid grid-cols-3 gap-4">
        <div
          v-for="table in tables"
          :key="table"
          @click="selectTable(table)"
          class="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
        >
          {{ table }}
        </div>
      </div>

      <div v-else>
        <div class="mb-4 flex items-center">
          <button
            @click="selectedTable = null"
            class="mr-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Tables
          </button>
          <h3 class="text-lg">Table: {{ selectedTable }}</h3>
        </div>
        <button
          @click="printData()"
          class="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Table
        </button>

        <!-- <vue3-excel-editor
          v-if="tableData.length"
          :rows="tableData"
          :columns="tableColumns"
          @change="handleDataChange"
        /> -->
        <vue-excel-editor v-model="tableData" v-if="tableData.length"  >
          <vue-excel-column
            v-for="tableColumn in tableColumns"
            :change="handleDataChange"
            :key="tableColumn.key"
            :field="tableColumn.key"
            :label="tableColumn.title"
            type="string"
          />
        </vue-excel-editor>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, toRaw } from "vue";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export default {

  setup() {
    const isLoggedIn = ref(false);
    const dbName = ref("");
    const password = ref("");
    const tables = ref([]);
    const selectedTable = ref(null);
    const tableData = ref([]);
    const randomNum = ref(null);

    const tableColumns = computed(() => {
      if (!tableData.value.length) return [];
      return Object.keys(tableData.value[0]).map((key) => ({
        title: key,
        key,
      }));
    });

    function printData() {
      console.log("tableColumns: ", tableColumns.value);
      console.log("tableData: ", tableData.value);
      console.log("selectedTable: ", selectedTable.value);
      console.log("tables: ", tables.value);
    }

    async function login() {
      try {
        const response = await axios.post(`${API_URL}/login`, {
          dbName: dbName.value,
          password: password.value,
        });

        if (response.data.randomNum) {
          randomNum.value = response.data.randomNum;
        }

        isLoggedIn.value = true;
        loadTables();
      } catch (error) {
        alert("Login failed: " + error.response?.data?.error || error.message);
      }
    }

    async function loadTables() {
      try {
        const response = await axios.post(`${API_URL}/tables`, {
          dbName: dbName.value,
          password: password.value,
        });
        tables.value = response.data.tables;
      } catch (error) {
        alert(
          "Failed to load tables: " + error.response?.data?.error ||
            error.message
        );
      }
    }

    async function selectTable(tableName) {
      selectedTable.value = tableName;
      try {
        const response = await axios.post(`${API_URL}/table-data`, {
          dbName: dbName.value,
          password: password.value,
          tableName,
        });
        tableData.value = response.data.data;
      } catch (error) {
        alert(
          "Failed to load table data: " + error.response?.data?.error ||
            error.message
        );
      }
    }

    async function handleDataChange(value, _prev, { $id, ...changedRow}, item) {  

      try {
         await axios.post(`${API_URL}/update-data`, {
          dbName: dbName.value,
          password: password.value,
          tableName: selectedTable.value,
          updates: [{...changedRow, [item.name]: value}]
        }); 
      } catch (error) {
        alert(
          "Failed to update data: " + error.response?.data?.error ||
            error.message
        );
      }
    }

    function logout() {
      isLoggedIn.value = false;
      dbName.value = "";
      password.value = "";
      tables.value = [];
      selectedTable.value = null;
      tableData.value = [];
      randomNum.value = null;
    }

    console.log("tableColumns: ", tableColumns.value);
    console.log("tableData: ", tableData.value);
    console.log("selectedTable: ", selectedTable.value);
    console.log("tables: ", tables.value);

    return {
      isLoggedIn,
      dbName,
      password,
      tables,
      selectedTable,
      tableData,
      tableColumns,
      randomNum,
      login,
      logout,
      selectTable,
      handleDataChange,
      printData,
    };
  },
};
</script>
