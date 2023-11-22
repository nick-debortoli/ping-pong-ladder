import { ChangeEvent } from 'react';
import './TextInput.scss';

interface TextInputProps {
    type: string;
    name: string;
    value: any;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

const TextInput: React.FC<TextInputProps> = ({ type, name, value, onChange, placeholder }) => {
    return (
        <>
            <input
                type={type}
                className="textbox"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </>
    );
};

export default TextInput;
