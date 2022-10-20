// @ts-nocheck

const allCommands = ["/nick", "/leave", "/list", "/join", "/create", "/delete"];
function Command() {
  return allCommands.map((command) => (
    <li className="list-group-item" key={command}>
      {command}
    </li>
  ));
}

export function Commands() {
  return (
    <pre id="command-list">
      <h5>Liste des commandes</h5>
      <Command />
    </pre>
  );
}
