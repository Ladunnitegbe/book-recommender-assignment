export default function SelectField(props) {
  const { placeholder, id, options, value, onSelect,className } = props

  return (<section role="dropdown" className="input">
    <select defaultValue={value} onChange={(e) => onSelect(e.target.value)} list={id} id={id}>
      <option value=""> {placeholder}</option>
      {
        options.map((val) => <option key={val} 
        >
        {val}
        </option>)
      }
    </select>
  </section>)
}