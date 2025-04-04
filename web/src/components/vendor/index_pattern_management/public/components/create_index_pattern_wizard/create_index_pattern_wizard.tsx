/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { ReactElement, Component } from "react";

import {
  EuiGlobalToastList,
  EuiGlobalToastListToast,
  EuiPageContent,
  EuiHorizontalRule,
} from "@elastic/eui";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { DocLinksStart } from "src/core/public";
import { StepIndexPattern } from "./components/step_index_pattern";
import { StepTimeField } from "./components/step_time_field";
import { Header } from "./components/header";
import { LoadingState } from "./components/loading_state";

// import { context as contextType } from '../../../../kibana_react/public';
import { getCreateBreadcrumbs } from "../breadcrumbs";
import { ensureMinimumTime, getIndices } from "./lib";
import { IndexPatternCreationConfig } from "../..";
import { IndexPatternManagmentContextValue } from "../../types";
import { MatchedItem } from "./types";
import { DuplicateIndexPatternError, IndexPattern } from "../../import";
import { useGlobalContext } from "../../context";

interface CreateIndexPatternWizardState {
  step: number;
  indexPattern: string;
  allIndices: MatchedItem[];
  remoteClustersExist: boolean;
  isInitiallyLoadingIndices: boolean;
  toasts: EuiGlobalToastListToast[];
  indexPatternCreationType: IndexPatternCreationConfig;
  selectedTimeField?: string;
  docLinks: DocLinksStart;
  viewName: string;
}

export class CreateIndexPatternWizard extends Component<
  RouteComponentProps,
  CreateIndexPatternWizardState
> {
  // static contextType = contextType;

  public readonly context!: IndexPatternManagmentContextValue;

  constructor(
    props: RouteComponentProps,
    context: IndexPatternManagmentContextValue
  ) {
    super(props, context);

    // context.services.setBreadcrumbs(getCreateBreadcrumbs());
    const { indexPatternManagementStart, docLinks } = useGlobalContext();

    const type =
      new URLSearchParams(props.location.search).get("type") || undefined;

    this.state = {
      step: 1,
      indexPattern: "",
      viewName: "",
      allIndices: [],
      remoteClustersExist: false,
      isInitiallyLoadingIndices: true,
      toasts: [],
      indexPatternCreationType: indexPatternManagementStart.creation.getType(
        type
      ), //context.services.indexPatternManagementStart.creation.getType(type),
      docLinks: docLinks, //context.services.docLinks,
    };
  }

  // async UNSAFE_componentWillMount() {
  //   this.fetchData();
  // }
  componentDidMount() {
    this.fetchData();
  }

  catchAndWarn = async (
    asyncFn: Promise<MatchedItem[]>,
    errorValue: [] | string[],
    errorMsg: ReactElement
  ) => {
    try {
      return await asyncFn;
    } catch (errors) {
      this.setState((prevState) => ({
        toasts: prevState.toasts.concat([
          {
            title: errorMsg,
            id: errorMsg.props.id,
            color: "warning",
            iconType: "alert",
          },
        ]),
      }));
      return errorValue;
    }
  };

  fetchData = async () => {
    //const { http } = this.context.services;
    const { http, data } = useGlobalContext(); //this.context.services;
    const getIndexTags = (indexName: string) =>
      this.state.indexPatternCreationType.getIndexTags(indexName);
    const searchClient = data.search.search; //this.context.services.data.search.search;

    const indicesFailMsg = "Failed to load indices";

    const clustersFailMsg = "Failed to load remote clusters";

    // query local and remote indices, updating state independently
    ensureMinimumTime(
      this.catchAndWarn(
        getIndices({ http, getIndexTags, pattern: "*", searchClient }),

        [],
        indicesFailMsg
      )
    ).then((allIndices: MatchedItem[]) =>
      this.setState({ allIndices, isInitiallyLoadingIndices: false })
    );

    this.catchAndWarn(
      // if we get an error from remote cluster query, supply fallback value that allows user entry.
      // ['a'] is fallback value
      getIndices({ http, getIndexTags, pattern: "*:*", searchClient }),

      ["a"],
      clustersFailMsg
    ).then((remoteIndices: string[] | MatchedItem[]) =>
      this.setState({ remoteClustersExist: !!remoteIndices.length })
    );
  };

  createIndexPattern = async (
    timeFieldName: string | undefined,
    indexPatternId: string
  ) => {
    let emptyPattern: IndexPattern;
    const { history } = this.props;
    const { indexPattern, viewName } = this.state;
    const { data } = useGlobalContext(); //add

    try {
      emptyPattern = await data.indexPatterns.createAndSave({
        //this.context.services.data.indexPatterns.createAndSave({
        id: indexPatternId,
        title: indexPattern,
        viewName: viewName,
        timeFieldName,
        ...this.state.indexPatternCreationType.getIndexPatternMappings(),
      });
    } catch (err) {
      if (err instanceof DuplicateIndexPatternError) {
        const confirmMessage = `An view with the title '${
          emptyPattern!.title
        }' already exists.`;

        const isConfirmed = false;
        // await this.context.services.overlays.openConfirm(confirmMessage, {
        //   confirmButtonText:  'Go to existing pattern',
        // });

        if (isConfirmed) {
          return history.push(`/patterns/${indexPatternId}`);
        } else {
          return;
        }
      } else {
        throw err;
      }
    }

    await data.indexPatterns.setDefault(emptyPattern.id as string); //this.context.services.data.indexPatterns.setDefault(emptyPattern.id as string);

    data.indexPatterns.clearCache(emptyPattern.id as string); //this.context.services.data.indexPatterns.clearCache(emptyPattern.id as string);
    history.push(`/patterns/${emptyPattern.id}`);
  };

  goToTimeFieldStep = (
    indexPattern: string,
    viewName: string,
    selectedTimeField?: string
  ) => {
    this.setState({ step: 2, indexPattern, selectedTimeField, viewName });
  };

  goToIndexPatternStep = () => {
    this.setState({ step: 1 });
  };

  renderHeader() {
    const { docLinks, indexPatternCreationType } = this.state;
    return (
      <Header
        prompt={indexPatternCreationType.renderPrompt()}
        indexPatternName={indexPatternCreationType.getIndexPatternName()}
        isBeta={indexPatternCreationType.getIsBeta()}
        docLinks={docLinks}
      />
    );
  }

  renderContent() {
    const {
      allIndices,
      isInitiallyLoadingIndices,
      step,
      indexPattern,
      viewName,
    } = this.state;

    if (isInitiallyLoadingIndices) {
      return <LoadingState />;
    }

    // const header = this.renderHeader();

    if (step === 1) {
      const { location } = this.props;
      const initialQuery =
        new URLSearchParams(location.search).get("id") || undefined;

      return (
        <EuiPageContent>
          {/* {header}
          <EuiHorizontalRule /> */}
          <StepIndexPattern
            allIndices={allIndices}
            initialQuery={indexPattern || initialQuery}
            initialViewName={viewName}
            indexPatternCreationType={this.state.indexPatternCreationType}
            goToNextStep={this.goToTimeFieldStep}
            showSystemIndices={
              this.state.indexPatternCreationType.getShowSystemIndices() &&
              this.state.step === 1
            }
          />
        </EuiPageContent>
      );
    }

    if (step === 2) {
      return (
        <EuiPageContent>
          {/* {header}
          <EuiHorizontalRule /> */}
          <StepTimeField
            indexPattern={indexPattern}
            viewName={viewName}
            goToPreviousStep={this.goToIndexPatternStep}
            createIndexPattern={this.createIndexPattern}
            indexPatternCreationType={this.state.indexPatternCreationType}
            selectedTimeField={this.state.selectedTimeField}
          />
        </EuiPageContent>
      );
    }

    return null;
  }

  removeToast = (id: string) => {
    this.setState((prevState) => ({
      toasts: prevState.toasts.filter((toast) => toast.id !== id),
    }));
  };

  render() {
    const content = this.renderContent();

    return (
      <>
        {content}
        <EuiGlobalToastList
          toasts={this.state.toasts}
          dismissToast={({ id }) => {
            this.removeToast(id);
          }}
          toastLifeTimeMs={6000}
        />
      </>
    );
  }
}

export const CreateIndexPatternWizardWithRouter = withRouter(
  CreateIndexPatternWizard
);
