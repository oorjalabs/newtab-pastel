// To prevent bright flashing when opening new tab with dark mode enabled
const useDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
if (useDark) {
    document.body.classList.add("system_init_dark");
}
else {
    document.body.classList.remove("system_init_dark");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25sb2FkVGhlbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJvbmxvYWRUaGVtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFDekUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLDhCQUE4QixDQUFDLENBQUMsT0FBTyxDQUFDO0FBQy9GLElBQUksT0FBTyxFQUFFO0lBQ1QsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Q0FDbkQ7S0FBTTtJQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0NBQ3REIn0=