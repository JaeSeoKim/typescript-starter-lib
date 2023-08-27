export type CardProps = {
  title: string
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        margin: "4px",
        borderRadius: "4px",
      }}
    >
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  )
}
