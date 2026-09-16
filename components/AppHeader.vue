<template>
  <header>
    <nav>
      <ul>
        <li>
          <NuxtLink to="/" exactActiveClass="is-active">Votaciones</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/mandarinafilm" exactActiveClass="is-active"
            >Video</NuxtLink
          >
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
a {
  display: block;
  text-decoration: inherit;
  color: inherit;
  width: 100%;
  height: 100%;
}

ol,
ul,
menu {
  list-style: none;
}

ul {
  display: flex;
  text-align: center;
}
li {
  flex: 100%;
}

nav li a.is-active {
  color: var(--gold);
}
</style>
