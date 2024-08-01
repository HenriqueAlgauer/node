const knex = require("../database/knex");

class NotesController {
  async create(request, response) {
    const { title, description, tags, links } = request.body;
    const { user_id } = request.params;

    // Use transações para garantir que todas as inserções sejam feitas corretamente
    const trx = await knex.transaction();

    try {
      // Insere a nota e obtém o ID gerado
      const [insertedNote] = await trx("notes")
        .insert({
          title,
          description,
          user_id,
        })
        .returning("id"); // Garante que o id seja retornado

      const note_id = insertedNote.id; // Extrai o ID do objeto retornado

      // Prepara a inserção dos links
      const linksInsert = links.map((link) => ({
        note_id,
        url: link,
      }));

      // Insere os links
      await trx("links").insert(linksInsert);

      // Prepara a inserção das tags
      const tagsInsert = tags.map((name) => ({
        note_id,
        name,
        user_id,
      }));

      // Insere as tags
      await trx("tags").insert(tagsInsert);

      // Confirma a transação
      await trx.commit();

      // Retorna a resposta com sucesso
      response.status(201).json({ message: "Deu certo :)" });
    } catch (error) {
      // Em caso de erro, desfaz a transação
      await trx.rollback();
      console.error("Error creating note:", error); // Log do erro
      response.status(500).json({ error: "Error creating note" });
    }
  }

  async show(request, response) {
    const { id } = request.params;

    const note = await knex("notes").where({ id }).first();
    const tags = await knex("tags").where({ note_id: id }).orderBy("name");
    const links = await knex("links")
      .where({ note_id: id })
      .orderBy("created_at");

    return response.json({
      ...note,
      tags,
      links,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("notes").where({ id }).delete();

    return response.json();
  }

  async index(request, response) {
    const { user_id, title, tags } = request.query;

    let notes;

    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());

      notes = await knex("tags")
        .select(["notes.id", "notes.title", "notes.user_id"])
        .where("notes.user_id", user_id)
        .whereLike("notes.title", `%${title}%`)
        .whereIn("name", filterTags)
<<<<<<< HEAD
        .innerJoin("notes", "notes.id", "tags.note_id")
        .orderBy("notes.title");
=======
        .innerJoin("notes", "notes.id", "tags.notes_id")
        .orderBy("notes.title");

      notes = await knex("tags").whereIn("name", filterTags);
>>>>>>> 3b3b29d2577e1bb61b8d8841dce1007a9841422c
    } else {
      notes = await knex("notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("tags").where({ user_id });
    const notesWithTags = notes.map((note) => {
      const noteTags = userTags.filter((tag) => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags,
      };
    });
    return response.json(notesWithTags);
  }
}

module.exports = NotesController;
