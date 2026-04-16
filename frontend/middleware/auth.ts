export default defineNuxtRouteMiddleware(() => {
    if (import.meta.server) return;

    const token = localStorage.getItem("token");

    if (!token) {
        return navigateTo("/login");
    }
});