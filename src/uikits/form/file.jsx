import { PhUploadSimple } from "../Icons";

export function CustomInputFile({ register, name, label, watch, resetField }) {
    const fileValue = watch(name);

    return (
        <div className="customFileInput flex f-col">
            <label htmlFor="">{label}</label>
            <section className="flex f-col f-wrap">
                <label htmlFor={"file-" + name}>
                    <input
                        type="file"
                        name={name}
                        id={"file-" + name}
                        {...register(name)}
                        accept="image/*,.pdf" // Optional: restrict to common file types
                    />
                    <div
                        className={
                            "fileSelector flex ai-c f-col jc-c " +
                            (fileValue && fileValue.length > 0 ? "fileSelected" : "")
                        }
                    >
                        <PhUploadSimple />
                        <p>Sélectionez le fichier</p>
                    </div>
                </label>

                {fileValue && fileValue.length > 0 && (
                    <p className="flex ai-c">
                        {fileValue[0].name}
                        <button type="button" onClick={() => resetField(name)}>X</button>
                    </p>
                )}
            </section>
        </div>
    );
}