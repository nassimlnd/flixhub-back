import Interaction from '#models/interaction'
import Profile from '#models/profile'
import db from '@adonisjs/lucid/services/db'

export async function userSimilarity(user1: Profile, user2: Profile) {
  // Récupération des historiques de visualisation des deux utilisateurs
  let user1History = await Interaction.query()
    .where('user_id', user1.id)
    .where('interaction_type', 'view')

  let user2History = await Interaction.query()
    .where('user_id', user2.id)
    .where('interaction_type', 'view')

  // Récupération des films en commun entre les deux utilisateurs
  let commonMovies = user1History.filter((movie) => user2History.includes(movie))

  // Si les deux utilisateurs n'ont pas de films en commun, on retourne 0
  if (commonMovies.length === 0) {
    return 0
  }

  // Récupération des ratings des utilisateurs et calcul des moyennes des ratings
  let mean1: number = 0
  let mean2: number = 0
  for (let movie of commonMovies) {
    mean1 += await db
      .from('ratings')
      .select('rating')
      .where('user_id', user1.id)
      .where('movie_id', movie.id)
      .first()

    mean2 += await db
      .from('ratings')
      .select('rating')
      .where('user_id', user2.id)
      .where('movie_id', movie.id)
      .first()
  }

  mean1 /= commonMovies.length
  mean2 /= commonMovies.length

  // Calcul de la somme des produits, la somme des carrés et le produit des sommes des carrés
  let sumProducts: number = 0
  let sumSquares1: number = 0
  let sumSquares2: number = 0
  for (let movie of commonMovies) {
    let rating1: number = await db
      .from('ratings')
      .select('rating')
      .where('user_id', user1.id)
      .where('movie_id', movie.id)
      .first()
    let rating2: number = await db
      .from('ratings')
      .select('rating')
      .where('user_id', user2.id)
      .where('movie_id', movie.id)
      .first()

    sumProducts += (rating1 - mean1) * (rating2 - mean2)
    sumSquares1 += Math.pow(rating1 - mean1, 2)
    sumSquares2 += Math.pow(rating2 - mean2, 2)
  }

  // Calcul du coefficient de corrélation de Pearson
  let numerator: number = sumProducts
  let denominator: number = Math.sqrt(sumSquares1 * sumSquares2)

  // Si le dénominateur est nul, on retourne 0
  if (denominator === 0) {
    return 0
  }

  let similarity: number = numerator / denominator

  return similarity
}
