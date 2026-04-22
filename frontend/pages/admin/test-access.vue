<template>
  <div class="test-access-page">
    <h1>Test Access Page</h1>
    <p>Nếu bạn thấy trang này, router và layout không tự động redirect.</p>
    <NuxtLink to="/admin">Quay lại Dashboard</NuxtLink>
  </div>
</template>

<script setup>
// Không middleware, không check quyền
</script>
