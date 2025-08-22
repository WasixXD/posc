CREATE TABLE deck(
    deck_id serial primary key,
    name varchar(50) not null,

    total_questions int default  0,
    correctness_percent real default 0
);

CREATE TABLE question (
    q_id serial primary key,
    deck_id int references deck (deck_id),
    tag_id int references tag (tag_id),

    typeof not null text,
    question not null text,
    correct not null char
);


CREATE TABLE tag (
    tag_id serial primary key,
    name varchar(50) not null
)

