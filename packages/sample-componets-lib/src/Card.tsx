export type CardProps = {
  title: string
  children?: React.ReactNode | undefined
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div
      data-testid="card"
      style={{
        display: "flex",
        flexDirection: "column",
        margin: "4px",
        borderRadius: "4px",
      }}
    >
      <h1 data-testid="card-title">{title}</h1>
      <div data-testid="card-children">{children}</div>
    </div>
  )
}
