import React from 'react';

const About: React.FC = () => {
    return (
        <div className="container">

            <div className='text-content'>
                <div>
                    <h2>About The Project</h2>
                    <p>This tool was developped to create and search different permutations (tabdīl pl. tabādīl) of a given Arabic name, using parts of the kunya and/or laqab, nasab, and nisba(s).</p>
                    <p></p>
                    <h2>How to Use</h2>
                    <ul>
                        <li>Enter in two of the three: kunya (e.g. Abū Manṣur), nasab (e.g. Maʿmar b. Aḥmad), and nisba (e.g. al-Iṣfahānī)</li>
                        <ul>
                            <li>You can also enter additional nisbas and/or a laqab</li>
                        </ul>
                        <li>There are three checkboxes, "2-Part Nasab", "Kunya + Nisba", and "Kunya + 1st Nasab" that are unchecked by default.</li>
                        <ul>
                            <li>Checking "2-part nasab" will perform a search just based on the first two names in the nasab, which can produce an extreme amount of results depending on the commonality of the names (see example below).</li>
                            <li>Checking "kunya + nisba" will include just the kunya and nisba in a search (see example below). </li>
                            <li>Checking "kunya + 1st nasab" will include just the kunya and first name in the nasab in a search (see example below). </li>
                        </ul>
                        <li>By default, this searches all 10,000+ texts from the <a href="mutun.pages.dev">mutūn corpus</a>, but you can filter and select a subset of these texts.</li>
                        <li>It will automatically search for: أبو، أبي، and أبا</li>
                        <li>It will automatically control for proclitics such as: و، ف، ك، ل، and ب</li>
                        <li>It normalizes all ḥamzas to increase matches</li>
                    </ul>
                    <p>Here is a list of permutations produced by the example of: أبو منصور معمر بن أحمد بن زياد الأصبهاني</p>
                </div>
                <div className='permuations-list'>
                    <ul className='right'>
                        <li>اب* منصور معمر الاصبهاني</li>
                        <li>اب* منصور معمر بن احمد</li>
                        <li>اب* منصور معمر بن احمد الاصبهاني</li>
                        <li>اب* منصور معمر بن احمد بن زياد</li>
                        <li>اب* منصور معمر بن احمد بن زياد الاصبهاني</li>
                        <li>اب* منصور بن احمد</li>
                        <li>اب* منصور بن احمد الاصبهاني</li>
                        <li>اب* منصور بن احمد بن زياد</li>
                        <li>اب* منصور بن احمد بن زياد الاصبهاني</li>
                        <li>معمر بن احمد بن زياد</li>
                        <li>معمر بن احمد بن زياد الاصبهاني</li>
                        <li>معمر بن احمد الاصبهاني</li>
                        <li className='red'>اب* منصور الاصبهاني (kunya + nisba)</li>
                        <li className='red'>اب* منصور معمر (1st nasab + kunya)</li>
                        <li className='red'>معمر بن احمد (2-part nasab)</li>
                    </ul>
                </div>
                <div>
                    <h2>Acknowledgements</h2>
                    <p>This web app links to another project I developed, mutūn (<a href="mutun.pages.dev">mutun.pages.dev</a>), which was inititally funded by a Faculty Digital Humanities Seed Grant at NYU.</p>
                    <h2>About Me</h2>
                    <p>My name is Antonio Musto, and I'm a Postdoctoral Visiting Lecturer at NYU, where I received my Ph.D. in 2024 from the Middle Eastern and Islamic Studies department. You can learn more about my work at <a href='https://www.antoniomusto.com'>my website</a>, my <a href="https://nyu.academia.edu/AntonioMusto">academia.edu</a> profile, and my <a href="https://github.com/ammusto">github</a>. You can also follow me on twitter <a href="https://x.com/deepcutiqtibas">@deepcutiqtibas</a>.</p>
                </div>
            </div>
        </div>
    );
};
export default About;