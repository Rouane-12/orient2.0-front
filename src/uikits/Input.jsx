import { useState } from "react"
import { PhEyeBold, PhEyeClosedBold } from "./Icons"

export function InputType({label,type,name,placeholder,onChange,value }){
      return(
            <div className="inputType">
            <label htmlFor={name}> {label} </label>
            <div>
                  {
                        type == "textarea" ? <textarea type={type} name={name} placeholder={placeholder} onChange={onChange} value={value} required />
                        : <input type={type} name={name} placeholder={placeholder} onChange={onChange} value={value} required />
                  }
            </div>
            </div>
      )
}

export function InpuTypePassword({label,name,placeholder,onChange }){
        const [showPassword, setShowPassword] = useState(false)
      return(
           <section className="inputType inputTypePassword">
             <label htmlFor={name}> {label} </label>
            
            <div className="flex ai-c">
                  <input type={showPassword? "text" : "password"} name={name} placeholder={placeholder} onChange={onChange} required />
                  
                  <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <PhEyeBold /> : <PhEyeClosedBold />}
                  </span>
            </div>
            </section>
      )
      }
      
