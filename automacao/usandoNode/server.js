const express = require("express");
const { gerarLista } = require("./scrapping");

const app = express();
app.use(express.json());

app.post("/gerar-lista", async (req, res) => {
	console.log(">>> Conexão recebida na rota /gerar-lista!");
	console.log(">>> Corpo da requisição (body):", req.body);

	try {
		const jsonData = req.body;

		const resultado = await gerarLista(jsonData);

		if (resultado) {
			res.status(200).json({
				status: "OK",
				mensagem: "Lista cadastrada com Sucesso",
			});
		}
	} catch (error) {
		console.error("Erro ao processar a rota /gerar-lista:", error);
		res.status(500).json({ status: "erro", mensagem: error.message });
	}
});

app.listen(3333, () => {
	console.log("Server started at port 3333");
});
