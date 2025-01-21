<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const list = ref(null)
let originalList = ref([])
const newTodo = ref({
  title: '',
  desc: '',
})
let isEditing = ref(null)

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/todos')
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
    list.value = await response.json()
    originalList.value = JSON.parse(JSON.stringify(list.value))
  } catch (error) {
    console.error('Error fetching todos:', error)
  }
})

const handleTodoUpdateStatus = async (id) => {
  try {
    const targetTodo = list.value.find((item) => item.id === id)
    const originalStatus = targetTodo?.completed
    if (targetTodo) {
      targetTodo.completed = !originalStatus
    }

    const response = await fetch('http://localhost:5000/todos/updateStatus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) throw new Error(`Request error: ${response.status}`)

    let updatedTodo
    try {
      updatedTodo = await response.json()
    } catch (error) {
      throw new Error('Failed to parse JSON response', error)
    }
    list.value = list.value.map((item) => (item.id === id ? { ...item, ...updatedTodo } : item))

    toast.success(
      `"${updatedTodo.title}" is now ${updatedTodo.completed ? 'completed' : 'open'}!`,
      {
        autoClose: 3000,
      },
    )
  } catch (error) {
    console.error('Error updating todo:', error)

    const targetTodo = list.value.find((item) => item.id === id)
    if (targetTodo) {
      targetTodo.completed = !targetTodo.completed
    }

    toast.error('Failed to update todo status. Please try again.', {
      autoClose: 3000,
    })
  }
}

const handleAddTodo = async () => {
  try {
    const response = await fetch('http://localhost:5000/todos/createTodo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo.value),
    })
    if (!response.ok) throw new Error(`Request error: ${response.status}`)
    const createdTodo = await response.json()
    list.value = [...list.value, createdTodo]
    toast.success('Todo has been added!', {
      autoClose: 3000,
    })
  } catch (error) {
    console.error('Error creating todo:', error)
  }
}

const cancelEdit = (id) => {
  const originalItem = originalList.value.find((item) => item.id === id)
  const currentItem = list.value.find((item) => item.id === id)

  if (originalItem && currentItem) {
    Object.assign(currentItem, originalItem)
  }

  isEditing.value = null
}

const handleTodoEdit = async ({ editedTodo, id }) => {
  if (editedTodo === originalList.value.find((item) => item.id === id)) return
  try {
    const response = await fetch('http://localhost:5000/todos/editTodo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editedTodo, id }),
    })

    if (!response.ok) throw new Error(`Request error: ${response.status}`)
    const { message, updatedTodo } = await response.json()

    console.log(message)
    list.value = list.value.map((item) => (item.id === id ? { ...item, ...updatedTodo } : item))

    toast.success('Todo updated successfully!', {
      autoClose: 3000,
    })
    isEditing.value = null
  } catch (error) {
    console.error('Error editing todo:', error)
  }
}

const handleTodoDelete = async (id) => {
  try {
    const response = await fetch('http://localhost:5000/todos/deleteTodo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!response.ok) throw new Error(`Request error: ${response.status}`)
    const { message, deletedTodo } = await response.json()

    console.log(message)
    list.value = list.value.filter((item) => item.id !== deletedTodo.id)

    toast.error('Todo deleted!', {
      autoClose: 3000,
    })
  } catch (error) {
    console.error('Error editing todo:', error)
  }
}
</script>

<template>
  <div class="flex gap-4">
    <div>
      <h1>Add New Todo</h1>
      <form @submit.prevent="handleAddTodo">
        <div class="flex flex-col">
          <label for="title">Title</label>
          <input class="border border-[gray]" type="text" name="title" v-model="newTodo.title" />
        </div>
        <div class="flex flex-col">
          <label for="desc">Description</label>
          <input class="border border-[gray]" type="text" name="desc" v-model="newTodo.desc" />
        </div>
        <button type="submit">Add</button>
      </form>
    </div>
    <div>
      <h1 class="text-[21px] underline">Todos</h1>
      <ul v-if="list && list.length">
        <li v-for="item in list" v-bind:key="item.id">
          <div>
            <div class="flex">
              <input
                class="text-base rounded transition duration-200"
                :class="{
                  'bg-yellow-100 border-2 border-blue-500 shadow-md': isEditing === item.id,
                  'bg-gray-100 border border-gray-300': isEditing !== item.id,
                  'line-through': item.completed,
                }"
                :disabled="isEditing !== item.id"
                type="text"
                v-model="item.title"
              />

              <button v-if="!(isEditing === item.id)" @click="() => (isEditing = item.id)">
                <i class="pi pi-pen-to-square"></i>
              </button>
              <div v-else>
                <button @click="handleTodoEdit({ editedTodo: item, id: item.id })">
                  <i class="pi pi-check"></i>
                </button>
                <button @click="cancelEdit(item.id)">
                  <i class="pi pi-times"></i>
                </button>
              </div>
              <button @click="handleTodoDelete(item.id)">
                <i class="ml-2 pi pi-trash" style="color: red"></i>
              </button>
            </div>

            <input
              class="text-base rounded transition duration-200 my-2"
              :class="{
                'bg-yellow-100 border-2 border-blue-500 shadow-md': isEditing === item.id,
                'bg-gray-100 border border-gray-300': isEditing !== item.id,
                'line-through': item.completed,
              }"
              :disabled="isEditing !== item.id"
              type="text"
              v-model="item.desc"
            />
            <input
              type="checkbox"
              @change="handleTodoUpdateStatus(item.id)"
              :checked="item.completed"
            />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
