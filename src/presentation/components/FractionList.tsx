interface Props {
  fractions: string[]
}

export function FractionList({ fractions }: Props) {
  if (fractions.length === 0) return <p>No fractions yet.</p>
  return (
    <ul>
      {fractions.map((f, i) => (
        <li key={`${f}-${i}`}>{f}</li>
      ))}
    </ul>
  )
}
