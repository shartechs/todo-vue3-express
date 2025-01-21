<script setup></script>

<template>
  <nav class="flex justify-between bg-red-700 text-white px-4 py-2">
    <div>Logo</div>

    <ul class="flex gap-2">
      <li><RouterLink to="/">Home</RouterLink></li>
      <li><RouterLink to="/Todos">Todos</RouterLink></li>
    </ul>
  </nav>
</template>
