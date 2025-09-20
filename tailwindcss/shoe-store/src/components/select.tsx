type SelectPropsT = {
  title: string;
  options: number[];
};
export default function Select({ title, options }: SelectPropsT) {
  console.log({ title, options });
  return (
    <div>
      <select>
        <option>{title}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
