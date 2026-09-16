<template>
  <div class="hero">
    <h1>
      <span>Mandarina Awards</span>
      <IconMandarina style="height: 1em; width: 1em" class="icon-pulse" />
    </h1>
    <p>Quien sera el mayor Mandarina esta temporada?</p>
    <div class="hero-rule"></div>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 20px 0 28px;
}

h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.hero-rule {
  width: 64px;
  height: 2px;
  background: var(--gold);
  margin: 18px auto 0;
  opacity: 0.7;
}

.hero h1 {
  font-family: "Fraunces", serif;
  font-weight: 600;
  font-size: clamp(32px, 7vw, 48px);
  margin: 0 0 8px;
  line-height: 1.08;
}
.hero p {
  color: var(--muted);
  font-size: 15px;
  margin: 0;
}
</style>
