const express = require("express");
const joyas = require("./db/joyas.js");
const app = express();
app.listen(3000, () => {
  console.log(`Server listening on port 3000`);
});

// HATEOAS: devuelve un array de objetos con los campos 'id' y 'nombre'
const HATEOAS = () => {
  return joyas.results;
};

// HATEOAS: devuelve un array de objetos con los campos 'id', 'nombre', 'modelo', 'categoria', 'metal', 'cadena', 'medida', 'valor' y 'stock'
const HATEOAS2 = () => {
  return joyas.results.map((e) => {
    return {
      id: e.id,
      nombre: e.name,
      modelo: e.model,
      categoria: e.category,
      metal: e.metal,
      cadena: e.cadena,
      medida: e.medida,
      valor: e.value,
      stock: e.stock,
    };
  });
};

app.get("/v1/joyas", (req, res) => {
  res.send({
    JOYAS: HATEOAS(),
  });
});

app.get("/v2/joyas", (req, res) => {
  res.send({
    JOYAS: HATEOAS2(),
  });
});

const filtrarCategoria = (category) => {
  return joyas.results.filter((x) => x.category == category);
};
app.get("/v1/joyas/category/:category", (req, res) => {
  const { category } = req.params;
  res.send({
    cantidad: filtrarCategoria(category).length,
    joyas: filtrarCategoria(category),
  });
});

const selecCampos = (joyas, campos) => {
  for (let prop in joyas) {
    if (!campos.includes(prop)) delete joyas[prop];
  }
  return joyas;
};
app.get("/v2/joyas/joya/:id", (req, res) => {
  const { id } = req.params;
  const { campos } = req.query;
  let joya = joyas.results.find((x) => x.id == id);
  if (campos) {
    let joyita = selecCampos(joya, campos.split(","));
    return res.send({
      joya: joyita,
    });
  }
  joya
    ? res.send({ joya: joyas.results.find((x) => x.id == id) })
    : res.status(404).send({
        error: "404 Not Found",
        message: `No existe ninguna joya con ese id: ${id}`,
      });
});

orderValues = (order) => {
  return order == "asc"
    ? joyas.results.sort((a, b) => (a.value > b.value ? 1 : -1))
    : order == "desc"
    ? joyas.results.sort((a, b) => (a.value < b.value ? 1 : -1))
    : false;
};

app.get("/api/v2/joyas", (req, res) => {
  const { values } = req.query;
  if (values == "asc") return res.send(orderValues("asc"));
  if (values == "desc") return res.send(orderValues("desc"));
  if (req.query.page) {
    const { page } = req.query;
    return res.send({ Joyas: HATEOAS2().slice(page * 3 - 3, page * 3) });
  }
  //HATEOAS: si no existe 'values' ni 'page' en la query, devolverá todas las joyas
  res.send({
    Joyas: HATEOAS2(),
  });
});
