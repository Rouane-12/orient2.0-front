export function CustomInputRadio({ register, name, label, options }) {
    return <div className="customRadioOrCheckbox flex f-col">
        <label htmlFor="">{label}</label>
        <section className="flex f-wrap">
            {
                options.map((item, i) => <label key={name + '' + i}>
                    <input type="radio" value={item.value} {...register(name)} />
                    <span>
                        {item.label}
                    </span>
                </label>)
            }
        </section>
    </div>
}

export function CustomInputCheckbox({ register, name, label, options }) {
    return <div className="customRadioOrCheckbox flex f-col">
        <label htmlFor="">{label}</label>
        <section className="flex f-wrap">
            {
                options.map((item, i) => <label key={name + '' + i}>
                    <input type="checkbox" value={item.value} {...register(name)} />
                    <span>
                        {item.label}
                    </span>
                </label>)
            }
        </section>
    </div>
}

