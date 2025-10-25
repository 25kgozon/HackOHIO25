import React, { useState } from "react";

const Rubric = () => {
    const [questions, setQuestions] = useState([]);

    // Add a new question
    const addQuestion = () => {
        setQuestions([
            ...questions,
            { id: Date.now(), text: "", parts: [] }
        ]);
    };

    // Remove a question
    const removeQuestion = (qId) => {
        setQuestions(questions.filter(q => q.id !== qId));
    };

    // Update question text
    const updateQuestionText = (qId, text) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, text } : q));
    };

    // Add a part to a question
    const addPart = (qId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    parts: [...q.parts, { id: Date.now(), text: "", points: 0 }]
                };
            }
            return q;
        }));
    };

    // Remove a part from a question
    const removePart = (qId, partId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    parts: q.parts.filter(p => p.id !== partId)
                };
            }
            return q;
        }));
    };

    // Update a part
    const updatePart = (qId, partId, key, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    parts: q.parts.map(p => p.id === partId ? { ...p, [key]: value } : p)
                };
            }
            return q;
        }));
    };

    return (
        <div className="rubric-section">
            <h4>Rubric</h4>

            {questions.map((q) => (
                <div key={q.id} className="rubric-question">
                    <div className="rubric-question-header">
                        <input
                            type="text"
                            placeholder="Question text"
                            value={q.text}
                            onChange={(e) => updateQuestionText(q.id, e.target.value)}
                        />
                        <button
                            className="btn btn-remove"
                            onClick={() => removeQuestion(q.id)}
                        >
                            Remove Question
                        </button>
                    </div>

                    {q.parts.map((p) => (
                        <div key={p.id} className="rubric-part">
                            <input
                                type="text"
                                placeholder="Part description"
                                value={p.text}
                                onChange={(e) => updatePart(q.id, p.id, "text", e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Points"
                                value={p.points}
                                onChange={(e) => updatePart(q.id, p.id, "points", Number(e.target.value))}
                            />
                            <button
                                className="btn btn-remove"
                                onClick={() => removePart(q.id, p.id)}
                            >
                                Remove Part
                            </button>
                        </div>
                    ))}

                    <button
                        className="btn btn-add-part"
                        onClick={() => addPart(q.id)}
                    >
                        + Add Part
                    </button>
                </div>
            ))}

            <button className="btn" onClick={addQuestion}>
                + Add Question
            </button>
        </div>
    );
};

export default Rubric;
