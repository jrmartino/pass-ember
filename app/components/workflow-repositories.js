import Component from '@ember/component';
import { inject as service, } from '@ember/service';
import EmberArray from '@ember/array';

function diff(array1, array2) {
  const retArray = [];
  array1.forEach((element1) => {
    let flag = false;
    array2.forEach((element2) => {
      if (element1.get('id') === element2.get('id')) {
        flag = true;
      }
    });
    if (!flag) {
      retArray.push(element1);
    }
  });
  return retArray;
}
export default Component.extend({
  addedRepositories: [],

  store: service('store'),
  isFirstTime: true,
  init() {
    this._super(...arguments);
    this.set('addedRepositories', []);
  },
  requiredRepositories: Ember.computed('model.repositories', function () {
    const grants = this.get('model.newSubmission.grants');
    const repos = Ember.A();
    grants.forEach((grant) => {
      // let repo = grant.get('primaryFunder.policy.repositories.content');
      let grepos = grant.get('primaryFunder.policy.repositories');
      let anyInSubmission = grepos.any(grantRepo => this.get('model.newSubmission.repositories').contains(grantRepo));

      if (grant.get('primaryFunder.policy.content') && grepos) {
        // NOT( (Don't include NIH deposit) AND (funder policy IS the NIH policy) )
        if (!(!this.get('includeNIHDeposit') && grant.get('primaryFunder.policy.title') === 'National Institute of Health Public Access Policy')) {
          grepos.forEach(r => repos.addObject(r));
        } else if (anyInSubmission) {
          // If the new submission already has the repositories for this grant
          // Remove those repositories (they are added back later)
          this.get('model.newSubmission.repositories').removeObjects(grepos);
        }
      }
    });
    // STEP 2
    repos.forEach((repo) => {
      this.send('addRepo', repo);
    });

    // STEP 3
    return repos;
  }),

  optionalRepositories: Ember.computed('requiredRepositories', function () {
    return this.get('model.repositories').filter(repo => repo.get('name') === 'JScholarship');
  }),
  didRender() {
    this._super(...arguments);
    this.get('model.repositories').filter((repo) => {
      if (repo.get('name') === 'JScholarship') {
        this.send('addRepo', repo);
      }
    });
  },
  actions: {
    next() {
      this.send('saveAll');
      this.sendAction('next');
    },
    back() {
      this.sendAction('back');
    },
    addRepo(repository) {
      this.get('addedRepositories').push(repository);
    },
    removeRepo(targetRepository) {
      const repositories = this.get('addedRepositories');
      repositories.forEach((repository, index) => {
        if (targetRepository.get('id') === repository.get('id')) {
          repositories.splice(index, 1);
        }
      });
    },
    saveAll() {
      this.get('addedRepositories').forEach((repositoryToAdd) => {
        if (!((this.get('model.newSubmission.repositories').contains(repositoryToAdd)))) {
          this.get('model.newSubmission.repositories').addObject(repositoryToAdd);
        }
      });
    },
    toggleRepository(repository) {
      if (event.target.checked) {
        this.send('addRepo', repository);
      } else {
        this.send('removeRepo', repository);
      }
    },
  },
});
