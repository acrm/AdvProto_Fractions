import { useFractionStore } from '../../application/useFractionStore'
import { fractionToString } from '../../domain/Fraction'
import { FractionList } from '../components/FractionList'

export function HomePage() {
  const { fractions, addFraction, reset } = useFractionStore()

  const handleAdd = () => {
    const n = Math.floor(Math.random() * 9) + 1
    const d = Math.floor(Math.random() * 9) + 1
    addFraction(n, d)
  }

  return (
    <div>
      <h1>AdvProto Fractions</h1>
      <p>Total: {fractions.length}</p>
      <button onClick={handleAdd}>Add Random Fraction</button>
      <button onClick={reset} style={{ marginLeft: '1rem' }}>Reset</button>
      <FractionList fractions={fractions.map(fractionToString)} />
    </div>
  )
}
