<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup>
import { computed } from 'vue'
import { persistClientSiteSettings } from '~/utils/siteSettings'

const config = useRuntimeConfig()
const { data } = await useFetch(`${config.public.apiBase}/public/general-settings`, {
    key: 'public-general-settings-app'
})

const siteFaviconUrl = computed(() => {
    const url = String(data.value?.data?.siteFaviconUrl || '').trim()
    return url || '/favicon.ico'
})

const siteFaviconHref = computed(() => {
    const base = siteFaviconUrl.value
    const separator = base.includes('?') ? '&' : '?'
    return `${base}${separator}v=${encodeURIComponent(base)}`
})

useHead(() => ({
    link: [
        {
            rel: 'icon',
            type: 'image/x-icon',
            href: siteFaviconHref.value
        },
        {
            rel: 'shortcut icon',
            href: siteFaviconHref.value
        }
    ]
}))

if (data.value?.data) {
    persistClientSiteSettings(data.value.data)
}
</script>