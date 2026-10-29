async function getCollection(resource) {
  const response = await fetch(`/api/${resource}`);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${resource}: ${response.status}`);
  }
  return response.json();
}

export function getInitialData() {
  return Promise.all([getCollection('workspaces'), getCollection('tasks')]);
}