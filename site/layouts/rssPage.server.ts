function init() {
  function dateToISO(date: string, d: string) {
    return (new Date(date)).toISOString();
  }

  return { dateToISO };
}

export { init };
