<script setup lang="ts">
import { useGx } from '../composables/useGx'

const { state, closeNotify, closeSwal } = useGx()
</script>

<template>
  <div class="gx-notify-stack">
    <div v-for="n in state.notifies" :key="n.id" :class="['alert', 'alert-' + n.type]" role="alert" data-notify="container">
      <button type="button" aria-hidden="true" class="close" data-notify="dismiss" @click="closeNotify(n.id)">×</button>
      <span data-notify="icon" class="fa fa-bell"></span>
      <span data-notify="title">{{ n.title }}</span>
      <span data-notify="message">{{ n.message }}</span>
    </div>
  </div>

  <div v-if="state.swal.visible" class="swal-overlay">
    <div class="swal-modal" role="dialog" aria-modal="true">
      <div v-if="state.swal.icon === 'warning'" class="swal-icon swal-icon--warning">
        <span class="swal-icon--warning__body"><span class="swal-icon--warning__dot"></span></span>
      </div>
      <div class="swal-title">{{ state.swal.title }}</div>
      <div class="swal-text">{{ state.swal.text }}</div>
      <div class="swal-footer">
        <div v-if="state.swal.cancel" class="swal-button-container">
          <button :class="state.swal.cancel.className" @click="closeSwal(false)">{{ state.swal.cancel.text }}</button>
        </div>
        <div class="swal-button-container">
          <button :class="state.swal.confirm.className" @click="closeSwal(true)">{{ state.swal.confirm.text }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="state.loading" class="gx-loading-overlay">
    <div class="gx-loading-spinner"></div>
    <div>{{ state.loadingText }}</div>
  </div>
</template>
