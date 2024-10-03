import React from 'react';
import Form from '../forms/form.tsx'; // Ensure the path is correct and matches your folder structure
import { FieldType } from '../forms/types';
import { SubmitHandler } from 'react-hook-form';
import { message } from 'antd';

const fields: FieldType[] = [
    { name: 'firstName', label: 'First Name', type: 'input', required: true, validation: { required: 'First name is required' } },
    { name: 'lastName', label: 'Last Name', type: 'input', required: true, validation: { required: 'Last name is required' } },
];


const MyPage: React.FC = () => {
    const onSubmit: SubmitHandler<any> = (data) => {
        console.log('Form Data: ', data);
        message.success('Form submitted successfully!');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h1>Styled Ant Design Form</h1>
            <Form fields={fields} onSubmit={onSubmit} />
        </div>
    );
};

export default MyPage;
