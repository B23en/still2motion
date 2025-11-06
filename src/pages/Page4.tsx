interface Page4Props {
  onReset: () => void
}

function Page4({ onReset }: Page4Props) {
  return (
    <div className="page">
      <h1>Page 4</h1>
      <button onClick={onReset}>Reset</button>
    </div>
  )
}

export default Page4
