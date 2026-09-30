const navigation = document.querySelector("#site-navigation");
const navigationToggle = document.querySelector("#navigation-toggle");
const search = document.querySelector("#site-search");
const searchToggles = document.querySelectorAll("[data-search-toggle]");
const desktop = matchMedia("(min-width: 1280px)");
let searchOpener;
let searchReady;
async function loadSearch() {
  if (!searchReady) {
    searchReady = (async () => {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/pagefind/pagefind-ui.css";
      document.head.append(stylesheet);
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "/pagefind/pagefind-ui.js";
        script.onload = resolve;
        script.onerror = () => {
          script.remove();
          reject(new Error("Search could not load"));
        };
        document.head.append(script);
      });
      document.querySelector("#search").textContent = "";
      new window.PagefindUI({
        element: "#search",
        showSubResults: true,
        showImages: false,
      });
    })().catch(() => {
      searchReady = undefined;
      document.querySelector("#search").textContent =
        "Search could not load. Close and reopen search to retry.";
    });
  }
  await searchReady;
  if (!search.hidden) search.querySelector("input")?.focus();
}

function setNavigation(open) {
  navigation.hidden = !open;
  navigationToggle.setAttribute("aria-expanded", String(open));
}
function setSearch(open) {
  search.hidden = !open;
  searchToggles.forEach((button) =>
    button.setAttribute("aria-expanded", String(open))
  );
  if (open) void loadSearch();
}
navigationToggle.addEventListener("click", () =>
  setNavigation(navigation.hidden)
);
searchToggles.forEach((button) =>
  button.addEventListener("click", () => {
    searchOpener = button;
    setSearch(search.hidden);
    if (!desktop.matches) setNavigation(false);
  })
);
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!search.hidden) {
    setSearch(false);
    searchOpener?.focus();
  } else if (!desktop.matches && !navigation.hidden) {
    setNavigation(false);
    navigationToggle.focus();
  }
});
desktop.addEventListener("change", () => setNavigation(desktop.matches));
setNavigation(desktop.matches);
