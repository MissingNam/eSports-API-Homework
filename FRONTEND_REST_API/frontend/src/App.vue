<template>
  <!-- v-main lo declara cada vista (PanelView, LoginView, RegistroView), porque PanelView
       necesita su propia barra y menú lateral dentro del layout de v-app. -->
  <v-app>
    <RouterView />
  </v-app>
</template>